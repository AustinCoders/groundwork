alter table public.profiles
  add column username text,
  add column is_public boolean not null default false,
  add column public_card jsonb,
  add column public_at timestamptz,
  add column email_weekly boolean not null default false,
  add column email_plan boolean not null default false,
  add column email_news boolean not null default false;

alter table public.profiles
  add constraint profiles_username_format
    check (username is null or (username ~ '^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$' and username !~ '--')),
  add constraint profiles_public_card_shape
    check (public_card is null or (jsonb_typeof(public_card) = 'object' and octet_length(public_card::text) <= 24000)),
  add constraint profiles_public_needs_username
    check (not is_public or username is not null);

create unique index profiles_username_key on public.profiles (username);

create or replace function private.guard_profile_public()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.username is distinct from old.username and new.username = any (array[
    'about', 'account', 'admin', 'administrator', 'api', 'app', 'auth', 'austincoders', 'blog', 'dashboard',
    'groundwork', 'help', 'login', 'logout', 'me', 'mod', 'moderator', 'null', 'privacy', 'profile',
    'root', 'security', 'settings', 'signin', 'signup', 'staff', 'support', 'system', 'team', 'terms',
    'u', 'undefined', 'user', 'users', 'www'
  ]) then
    raise exception 'username_reserved' using errcode = 'check_violation';
  end if;
  if new.public_card is distinct from old.public_card then
    new.public_at := case when new.public_card is null then null else now() end;
  end if;
  return new;
end;
$$;

revoke execute on function private.guard_profile_public() from public, anon, authenticated;

create trigger profiles_guard_public before update on public.profiles
  for each row execute function private.guard_profile_public();

grant update (username, is_public, public_card, email_weekly, email_plan, email_news) on public.profiles to authenticated;

create or replace function public.public_profile(name text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('username', p.username, 'card', p.public_card, 'at', p.public_at)
    from public.profiles p
   where p.username = lower(left(coalesce(name, ''), 40))
     and p.is_public
     and p.public_card is not null;
$$;

revoke execute on function public.public_profile(text) from public;
grant execute on function public.public_profile(text) to anon, authenticated;

create table private.security_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now(),
  kind text not null check (kind in (
    'sign_in', 'second_step', 'two_step_on', 'two_step_off',
    'email_changed', 'password_changed', 'provider_linked', 'provider_unlinked'
  )),
  ip inet,
  agent text check (char_length(agent) <= 400),
  detail text check (char_length(detail) <= 60)
);

create index security_events_user_at on private.security_events (user_id, at desc);

alter table private.security_events enable row level security;

revoke all on private.security_events from public, anon, authenticated;

create or replace function private.log_security(who uuid, what text, from_ip inet, from_agent text, note text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.security_events (user_id, kind, ip, agent, detail)
  values (who, what, from_ip, left(from_agent, 400), left(note, 60));
  delete from private.security_events e
   where e.user_id = who
     and (e.at < now() - interval '90 days'
          or e.id in (
            select x.id from private.security_events x
             where x.user_id = who
             order by x.at desc, x.id desc
             offset 100
          ));
exception when others then
  null;
end;
$$;

revoke execute on function private.log_security(uuid, text, inet, text, text) from public, anon, authenticated;

create or replace function private.on_session_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    if tg_op = 'INSERT' then
      perform private.log_security(new.user_id, 'sign_in', new.ip, new.user_agent, null);
    elsif new.aal is distinct from old.aal and new.aal::text = 'aal2' then
      perform private.log_security(new.user_id, 'second_step', new.ip, new.user_agent, null);
    end if;
  exception when others then
    null;
  end;
  return null;
end;
$$;

create or replace function private.on_factor_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    if tg_op = 'UPDATE' and new.status::text = 'verified' and old.status::text is distinct from 'verified' then
      perform private.log_security(new.user_id, 'two_step_on', null, null, new.factor_type::text);
    elsif tg_op = 'DELETE' and old.status::text = 'verified' then
      perform private.log_security(old.user_id, 'two_step_off', null, null, old.factor_type::text);
    end if;
  exception when others then
    null;
  end;
  return null;
end;
$$;

create or replace function private.on_user_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    if new.email is distinct from old.email and old.email is not null then
      perform private.log_security(new.id, 'email_changed', null, null, null);
    end if;
    if new.encrypted_password is distinct from old.encrypted_password
       and coalesce(old.encrypted_password, '') <> '' then
      perform private.log_security(new.id, 'password_changed', null, null, null);
    end if;
  exception when others then
    null;
  end;
  return null;
end;
$$;

create or replace function private.on_identity_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    if tg_op = 'INSERT' then
      if exists (select 1 from auth.users u where u.id = new.user_id and u.created_at < now() - interval '2 minutes') then
        perform private.log_security(new.user_id, 'provider_linked', null, null, new.provider);
      end if;
    else
      perform private.log_security(old.user_id, 'provider_unlinked', null, null, old.provider);
    end if;
  exception when others then
    null;
  end;
  return null;
end;
$$;

revoke execute on function private.on_session_change() from public, anon, authenticated;
revoke execute on function private.on_factor_change() from public, anon, authenticated;
revoke execute on function private.on_user_change() from public, anon, authenticated;
revoke execute on function private.on_identity_change() from public, anon, authenticated;

create trigger security_log_sessions
  after insert or update of aal on auth.sessions
  for each row execute function private.on_session_change();

create trigger security_log_factors
  after update of status or delete on auth.mfa_factors
  for each row execute function private.on_factor_change();

create trigger security_log_users
  after update of email, encrypted_password on auth.users
  for each row execute function private.on_user_change();

create trigger security_log_identities
  after insert or delete on auth.identities
  for each row execute function private.on_identity_change();

create or replace function public.my_security_activity()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  current_session uuid;
begin
  if caller is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if not (select private.second_step_satisfied()) then
    raise exception 'second step needed' using errcode = '42501';
  end if;
  begin
    current_session := nullif((select auth.jwt()) ->> 'session_id', '')::uuid;
  exception when others then
    current_session := null;
  end;
  return jsonb_build_object(
    'current', current_session,
    'sessions', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', s.id,
               'created_at', s.created_at,
               'seen_at', coalesce(s.refreshed_at::timestamptz, s.updated_at, s.created_at),
               'ip', host(s.ip),
               'agent', left(s.user_agent, 300),
               'aal', s.aal::text
             ) order by coalesce(s.refreshed_at::timestamptz, s.updated_at, s.created_at) desc)
        from auth.sessions s
       where s.user_id = caller
         and (s.not_after is null or s.not_after > now())
    ), '[]'::jsonb),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
               'at', e.at,
               'kind', e.kind,
               'ip', host(e.ip),
               'agent', e.agent,
               'detail', e.detail
             ) order by e.at desc, e.id desc)
        from (
          select * from private.security_events x
           where x.user_id = caller
           order by x.at desc, x.id desc
           limit 50
        ) e
    ), '[]'::jsonb)
  );
end;
$$;

revoke execute on function public.my_security_activity() from public, anon;
grant execute on function public.my_security_activity() to authenticated;

create or replace function public.end_my_session(target uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  current_session uuid;
  removed integer;
begin
  if caller is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if not (select private.second_step_satisfied()) then
    raise exception 'second step needed' using errcode = '42501';
  end if;
  begin
    current_session := nullif((select auth.jwt()) ->> 'session_id', '')::uuid;
  exception when others then
    current_session := null;
  end;
  if target is null or target = current_session then
    return false;
  end if;
  delete from auth.sessions s where s.id = target and s.user_id = caller;
  get diagnostics removed = row_count;
  return removed > 0;
end;
$$;

revoke execute on function public.end_my_session(uuid) from public, anon;
grant execute on function public.end_my_session(uuid) to authenticated;
