drop function if exists public.tmp_header_probe();

create table if not exists private.email_checks (
  id bigint generated always as identity primary key,
  who text not null,
  at timestamptz not null default now()
);

create index if not exists email_checks_who_at on private.email_checks (who, at);
create index if not exists email_checks_at on private.email_checks (at);

alter table private.email_checks enable row level security;
revoke all on private.email_checks from public, anon, authenticated;

create or replace function public.email_status(address text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  clean text := lower(btrim(coalesce(address, '')));
  caller text := md5('gw-email-check:' || coalesce(headers ->> 'cf-connecting-ip', 'unknown'));
  account record;
begin
  if length(clean) > 254 or clean !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$' then
    return jsonb_build_object('status', 'invalid');
  end if;

  delete from private.email_checks where at < now() - interval '1 hour';

  if (select count(*) from private.email_checks where who = caller and at > now() - interval '10 minutes') >= 30
    or (select count(*) from private.email_checks where at > now() - interval '1 minute') >= 120 then
    return jsonb_build_object('status', 'limited');
  end if;

  insert into private.email_checks (who) values (caller);

  select
    u.id,
    coalesce(u.encrypted_password, '') <> '' as has_password,
    u.email_confirmed_at is not null as confirmed
  into account
  from auth.users u
  where lower(u.email) = clean
    and u.deleted_at is null
    and not coalesce(u.is_anonymous, false)
  limit 1;

  if not found then
    return jsonb_build_object('status', 'none');
  end if;

  return jsonb_build_object(
    'status', 'exists',
    'password', account.has_password,
    'confirmed', account.confirmed,
    'providers', coalesce(
      (
        select jsonb_agg(distinct i.provider)
        from auth.identities i
        where i.user_id = account.id and i.provider in ('email', 'google', 'github')
      ),
      '[]'::jsonb
    )
  );
end;
$$;

revoke all on function public.email_status(text) from public;
grant execute on function public.email_status(text) to anon, authenticated;
