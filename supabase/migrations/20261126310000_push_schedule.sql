create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create or replace function public.push_config()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'tick', (select s.decrypted_secret from vault.decrypted_secrets s where s.name = 'push_tick_secret'),
    'public', (select s.decrypted_secret from vault.decrypted_secrets s where s.name = 'vapid_public_key'),
    'private', (select s.decrypted_secret from vault.decrypted_secrets s where s.name = 'vapid_private_key'),
    'subject', coalesce((select s.decrypted_secret from vault.decrypted_secrets s where s.name = 'vapid_subject'), 'mailto:help@austincoders.com')
  );
$$;

revoke execute on function public.push_config() from public, anon, authenticated;
grant execute on function public.push_config() to service_role;

select cron.schedule(
  'push-tick',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://wlyfdbfqwwqvfbfxmeay.supabase.co/functions/v1/push-tick',
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-push-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'push_tick_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
  $$
);
