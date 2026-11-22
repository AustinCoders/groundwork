create table public.resume_docs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  analysis jsonb not null check (jsonb_typeof(analysis) = 'object' and octet_length(analysis::text) <= 300000),
  marks jsonb not null default '{}'::jsonb check (jsonb_typeof(marks) = 'object' and octet_length(marks::text) <= 40000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resume_docs_user_created on public.resume_docs (user_id, created_at desc);

alter table public.resume_docs enable row level security;

create policy "resume_docs: read own" on public.resume_docs
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "resume_docs: insert own" on public.resume_docs
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "resume_docs: update own" on public.resume_docs
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "resume_docs: delete own" on public.resume_docs
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "resume_docs: second step when enrolled" on public.resume_docs
  as restrictive for all to authenticated
  using ((select private.second_step_satisfied()))
  with check ((select private.second_step_satisfied()));

revoke all on public.resume_docs from anon, authenticated;
grant select, insert, delete on public.resume_docs to authenticated;
grant update (title, marks) on public.resume_docs to authenticated;

create or replace function private.limit_resume_docs()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('resume_docs:' || new.user_id::text, 0));
  if (select count(*) from public.resume_docs where user_id = new.user_id) >= 5 then
    raise exception 'resume_limit' using errcode = 'P0001', hint = 'Delete a saved resume before adding another.';
  end if;
  return new;
end;
$$;

revoke all on function private.limit_resume_docs() from public, anon, authenticated;

create trigger resume_docs_limit
  before insert on public.resume_docs
  for each row execute function private.limit_resume_docs();

create trigger resume_docs_touch
  before update on public.resume_docs
  for each row execute function public.touch_updated_at();
