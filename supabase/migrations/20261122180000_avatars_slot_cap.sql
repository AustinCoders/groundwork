update storage.buckets
set allowed_mime_types = array['image/webp', 'image/jpeg']
where id = 'avatars';

create or replace function private.avatar_slot_free()
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me text := (select auth.uid())::text;
begin
  if me is null then
    return false;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('avatars:' || me, 0));
  return (
    select count(*) < 3
    from storage.objects
    where bucket_id = 'avatars'
      and (storage.foldername(name))[1] = me
  );
end;
$$;

revoke all on function private.avatar_slot_free() from public, anon;
grant execute on function private.avatar_slot_free() to authenticated;

drop policy if exists "avatars: add own" on storage.objects;
drop policy if exists "avatars: change own" on storage.objects;

create policy "avatars: add own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~ '^[0-9a-f-]{36}/avatar-[0-9]{10,16}\.(webp|jpg)$'
    and (select private.second_step_satisfied())
    and private.avatar_slot_free()
  );
