create table private.resume_runs (
  user_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now()
);

create index resume_runs_user_at on private.resume_runs (user_id, at);

alter table private.resume_runs enable row level security;

revoke all on private.resume_runs from public, anon, authenticated;

create or replace function public.claim_resume_run()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  per_day constant integer := 40;
  per_minute constant integer := 8;
  used_day integer;
  used_minute integer;
  oldest timestamptz;
begin
  if caller is null or coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) then
    return jsonb_build_object('ok', false, 'reason', 'signed_out');
  end if;

  if not (select private.second_step_satisfied()) then
    return jsonb_build_object('ok', false, 'reason', 'second_step');
  end if;

  if not exists (
    select 1
      from auth.users u
     where u.id = caller
       and not coalesce(u.is_anonymous, false)
       and u.banned_until is null
       and u.deleted_at is null
       and (u.email_confirmed_at is not null or u.phone_confirmed_at is not null)
  ) then
    return jsonb_build_object('ok', false, 'reason', 'unconfirmed');
  end if;

  perform pg_advisory_xact_lock(hashtextextended('resume_runs:' || caller::text, 0));

  delete from private.resume_runs r
   where r.user_id = caller
     and r.at < now() - interval '1 day';

  select count(*), min(r.at),
         count(*) filter (where r.at > now() - interval '1 minute')
    into used_day, oldest, used_minute
    from private.resume_runs r
   where r.user_id = caller;

  if used_day >= per_day then
    return jsonb_build_object('ok', false, 'reason', 'limit', 'retry_at', oldest + interval '1 day');
  end if;

  if used_minute >= per_minute then
    return jsonb_build_object('ok', false, 'reason', 'busy', 'retry_at', now() + interval '1 minute');
  end if;

  insert into private.resume_runs (user_id) values (caller);

  return jsonb_build_object('ok', true, 'left', per_day - used_day - 1);
end;
$$;

revoke execute on function public.claim_resume_run() from public, anon;
grant execute on function public.claim_resume_run() to authenticated;
