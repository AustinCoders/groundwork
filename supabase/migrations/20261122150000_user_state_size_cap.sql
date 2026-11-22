alter table public.user_state
  add column size integer generated always as (octet_length(value::text)) stored;

create or replace function public.limit_user_state_rows()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  rows_now integer;
  bytes_now bigint;
begin
  select count(*), coalesce(sum(s.size), 0)
    into rows_now, bytes_now
    from public.user_state s
   where s.user_id = new.user_id
     and s.key <> new.key;
  if rows_now >= 3000 then
    raise exception 'user_state limit reached' using errcode = 'check_violation';
  end if;
  if bytes_now + octet_length(new.value::text) > 5242880 then
    raise exception 'user_state size limit reached' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists user_state_limit on public.user_state;

create trigger user_state_limit before insert or update on public.user_state
  for each row execute function public.limit_user_state_rows();

revoke execute on function public.limit_user_state_rows() from public, anon, authenticated;
