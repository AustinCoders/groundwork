create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 60),
  goal text check (goal in ('learn', 'interview', 'switch', 'upskill')),
  experience text check (experience in ('beginner', 'intermediate', 'advanced')),
  target_role text check (target_role in ('frontend', 'backend', 'fullstack', 'other')),
  plan text not null default 'free' check (plan in ('free', 'pro')),
  plan_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per Groundwork account. plan and plan_expires_at are written only by the service role.';

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, goal, experience, target_role) on public.profiles to authenticated;

create table public.user_state (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null check (key ~ '^(jsnotes|groundwork):[A-Za-z0-9:_./-]{1,180}$'),
  value jsonb not null check (octet_length(value::text) <= 2000000),
  client_at bigint not null check (client_at > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

comment on table public.user_state is 'Saved browser state for a Groundwork account: one row per localStorage key the site syncs.';

alter table public.user_state enable row level security;

create policy "user_state: read own" on public.user_state
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_state: insert own" on public.user_state
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "user_state: update own" on public.user_state
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "user_state: delete own" on public.user_state
  for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.user_state from anon, authenticated;
grant select, insert, update, delete on public.user_state to authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger user_state_touch before update on public.user_state
  for each row execute function public.touch_updated_at();

create or replace function public.limit_user_state_rows()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.user_state where user_id = new.user_id) >= 3000 then
    raise exception 'user_state limit reached' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger user_state_limit before insert on public.user_state
  for each row execute function public.limit_user_state_rows();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'user_name'), ''),
        split_part(coalesce(new.email, ''), '@', 1)
      ),
      60
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  delete from auth.users where id = me;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.limit_user_state_rows() from public, anon, authenticated;
