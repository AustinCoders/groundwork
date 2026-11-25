create or replace function public.push_public_key()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select s.decrypted_secret from vault.decrypted_secrets s where s.name = 'vapid_public_key';
$$;

revoke execute on function public.push_public_key() from public, anon;
grant execute on function public.push_public_key() to authenticated;
