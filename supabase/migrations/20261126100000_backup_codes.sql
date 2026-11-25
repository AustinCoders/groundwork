create table private.backup_codes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  hash text not null,
  created_at timestamptz not null default now()
);

create index backup_codes_user on private.backup_codes (user_id);

create table private.backup_tries (
  user_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now()
);

create index backup_tries_user on private.backup_tries (user_id, at);

alter table private.backup_codes enable row level security;
alter table private.backup_tries enable row level security;
revoke all on private.backup_codes, private.backup_tries from public, anon, authenticated;

create or replace function private.backup_caller()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null or coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) then
    raise exception 'signed_out' using errcode = '42501';
  end if;
  return caller;
end;
$$;

revoke execute on function private.backup_caller() from public, anon, authenticated;

create or replace function public.create_backup_codes()
returns text[]
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.backup_caller();
  alphabet constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
  raw bytea;
  code text;
  codes text[] := '{}';
begin
  if coalesce((select auth.jwt()) ->> 'aal', 'aal1') <> 'aal2' or not exists (
    select 1 from auth.mfa_factors f where f.user_id = me and f.status = 'verified'
  ) then
    raise exception 'second_step' using errcode = '42501';
  end if;
  delete from private.backup_codes where user_id = me;
  for i in 1..10 loop
    raw := extensions.gen_random_bytes(12);
    code := '';
    for j in 0..11 loop
      code := code || substr(alphabet, (get_byte(raw, j) % length(alphabet)) + 1, 1);
    end loop;
    insert into private.backup_codes (user_id, hash) values (me, extensions.crypt(code, extensions.gen_salt('bf', 8)));
    codes := codes || (substr(code, 1, 4) || '-' || substr(code, 5, 4) || '-' || substr(code, 9, 4));
  end loop;
  return codes;
end;
$$;

create or replace function public.backup_codes_left()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer from private.backup_codes where user_id = private.backup_caller();
$$;

create or replace function public.use_backup_code(code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.backup_caller();
  clean text := lower(regexp_replace(coalesce(left(code, 64), ''), '[^a-zA-Z0-9]', '', 'g'));
  hit bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended('backup:' || me::text, 0));
  delete from private.backup_tries t where t.user_id = me and t.at < now() - interval '1 day';
  if (select count(*) from private.backup_tries t where t.user_id = me and t.at > now() - interval '1 hour') >= 5 then
    return jsonb_build_object('status', 'limit');
  end if;
  insert into private.backup_tries (user_id) values (me);
  if length(clean) <> 12 then
    return jsonb_build_object('status', 'wrong');
  end if;
  select b.id into hit
    from private.backup_codes b
   where b.user_id = me and b.hash = extensions.crypt(clean, b.hash)
   limit 1;
  if hit is null then
    return jsonb_build_object('status', 'wrong');
  end if;
  delete from private.backup_codes where user_id = me;
  delete from auth.mfa_factors where user_id = me;
  return jsonb_build_object('status', 'used');
end;
$$;

create or replace function private.drop_backup_codes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    if not exists (
      select 1 from auth.mfa_factors f where f.user_id = old.user_id and f.status = 'verified'
    ) then
      delete from private.backup_codes where user_id = old.user_id;
    end if;
  exception when others then
    null;
  end;
  return null;
end;
$$;

revoke execute on function private.drop_backup_codes() from public, anon, authenticated;

create trigger mfa_factors_drop_backup_codes after delete on auth.mfa_factors
  for each row execute function private.drop_backup_codes();

revoke execute on function public.create_backup_codes() from public, anon;
revoke execute on function public.backup_codes_left() from public, anon;
revoke execute on function public.use_backup_code(text) from public, anon;
grant execute on function public.create_backup_codes() to authenticated;
grant execute on function public.backup_codes_left() to authenticated;
grant execute on function public.use_backup_code(text) to authenticated;
