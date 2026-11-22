create schema if not exists private;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.second_step_satisfied()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
    or not exists (
      select 1
        from auth.mfa_factors f
       where f.user_id = (select auth.uid())
         and f.status = 'verified'
    );
$$;

revoke execute on function private.second_step_satisfied() from public, anon;
grant execute on function private.second_step_satisfied() to authenticated;

create policy "profiles: second step when enrolled" on public.profiles
  as restrictive for all to authenticated
  using ((select private.second_step_satisfied()))
  with check ((select private.second_step_satisfied()));

create policy "user_state: second step when enrolled" on public.user_state
  as restrictive for all to authenticated
  using ((select private.second_step_satisfied()))
  with check ((select private.second_step_satisfied()));

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
  if not private.second_step_satisfied() then
    raise exception 'insufficient_aal' using errcode = '42501';
  end if;
  delete from auth.users where id = me;
end;
$$;
