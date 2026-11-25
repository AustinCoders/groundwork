create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  actor uuid references auth.users (id) on delete cascade,
  kind text not null check (char_length(kind) between 3 and 30),
  ref text check (ref is null or char_length(ref) <= 60),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index notifications_user on public.notifications (user_id, created_at desc);

create table public.buddies (
  id bigint generated always as identity primary key,
  requester uuid not null references auth.users (id) on delete cascade,
  addressee uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  check (requester <> addressee)
);

create unique index buddies_pair on public.buddies (least(requester, addressee), greatest(requester, addressee));
create index buddies_requester on public.buddies (requester);
create index buddies_addressee on public.buddies (addressee);

create table public.study_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 60),
  about text not null default '' check (char_length(about) <= 200),
  owner uuid not null references auth.users (id) on delete cascade,
  code text not null unique check (code ~ '^[a-z0-9]{10}$'),
  created_at timestamptz not null default now()
);

create index study_groups_owner on public.study_groups (owner);

create table public.group_members (
  group_id uuid not null references public.study_groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active')),
  created_at timestamptz not null default now(),
  joined_at timestamptz,
  primary key (group_id, user_id)
);

create index group_members_user on public.group_members (user_id, status);

create table public.peer_mocks (
  id uuid primary key default gen_random_uuid(),
  host uuid not null references auth.users (id) on delete cascade,
  guest uuid not null references auth.users (id) on delete cascade,
  interviewer uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null,
  minutes integer not null default 45 check (minutes in (30, 45, 60)),
  topic text not null check (topic in ('javascript', 'react', 'frontend', 'backend', 'system-design', 'dsa', 'behavioural')),
  link text not null check (
    char_length(link) <= 300
    and link ~ '^https://(meet\.google\.com|([a-z0-9-]+\.)?zoom\.us|teams\.microsoft\.com|teams\.live\.com|meet\.jit\.si|whereby\.com|discord\.gg|discord\.com)/[^\s<>"]*$'
  ),
  note text not null default '' check (char_length(note) <= 300),
  status text not null default 'invited' check (status in ('invited', 'accepted', 'declined', 'cancelled')),
  score jsonb check (score is null or (jsonb_typeof(score) = 'object' and octet_length(score::text) <= 4000)),
  scored_at timestamptz,
  created_at timestamptz not null default now(),
  check (host <> guest),
  check (interviewer = host or interviewer = guest)
);

create index peer_mocks_host on public.peer_mocks (host, at desc);
create index peer_mocks_guest on public.peer_mocks (guest, at desc);

alter table public.notifications enable row level security;
alter table public.buddies enable row level security;
alter table public.study_groups enable row level security;
alter table public.group_members enable row level security;
alter table public.peer_mocks enable row level security;

revoke all on public.notifications, public.buddies, public.study_groups, public.group_members, public.peer_mocks
  from public, anon, authenticated;

create or replace function private.notify(target uuid, by_user uuid, what text, about text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if target is null or target = by_user or (by_user is not null and private.network_blocked(target, by_user)) then
    return;
  end if;
  update public.notifications n
     set created_at = now()
   where n.user_id = target
     and n.actor is not distinct from by_user
     and n.kind = what
     and n.ref is not distinct from about
     and n.read_at is null
     and n.created_at > now() - interval '1 day';
  if not found then
    insert into public.notifications (user_id, actor, kind, ref) values (target, by_user, what, about);
  end if;
  delete from public.notifications n where n.user_id = target and n.created_at < now() - interval '60 days';
end;
$$;

revoke execute on function private.notify(uuid, uuid, text, text) from public, anon, authenticated;

create or replace function private.notify_connection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    if tg_op = 'INSERT' then
      perform private.notify(new.addressee, new.requester, 'request', null);
    elsif tg_op = 'UPDATE' and new.status = 'accepted' and old.status <> 'accepted' then
      perform private.notify(new.requester, new.addressee, 'accepted', null);
    elsif tg_op = 'DELETE' then
      delete from public.buddies b
       where least(b.requester, b.addressee) = least(old.requester, old.addressee)
         and greatest(b.requester, b.addressee) = greatest(old.requester, old.addressee);
      delete from public.notifications n
       where n.kind = 'request' and n.read_at is null and n.user_id = old.addressee and n.actor = old.requester;
    end if;
  exception when others then
    null;
  end;
  return null;
end;
$$;

create or replace function private.notify_cheer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    perform private.notify(new.receiver, new.sender, 'cheer_' || new.kind, null);
  exception when others then
    null;
  end;
  return null;
end;
$$;

revoke execute on function private.notify_connection() from public, anon, authenticated;
revoke execute on function private.notify_cheer() from public, anon, authenticated;

create trigger connections_notify after insert or update or delete on public.connections
  for each row execute function private.notify_connection();

create trigger cheers_notify after insert on public.cheers
  for each row execute function private.notify_cheer();

create or replace function private.network_face(who uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'username', p.username,
    'name', coalesce(nullif(p.network_card ->> 'name', ''), p.display_name),
    'headline', coalesce(p.network_card ->> 'headline', ''),
    'role', p.network_card ->> 'role',
    'color', p.network_card ->> 'color',
    'art', p.network_card ->> 'art',
    'level', p.network_card -> 'level',
    'streak', p.network_card -> 'streak',
    'xp', p.network_card -> 'xp',
    'chapters', p.network_card -> 'chapters',
    'exercises', p.network_card -> 'exercises',
    'heat', p.network_card -> 'heat',
    'heatEnd', p.network_card -> 'heatEnd',
    'goal', p.network_card -> 'goal',
    'challenge', p.network_card -> 'challenge',
    'daily', p.network_card -> 'daily',
    'at', p.network_at
  )
    from public.profiles p
   where p.id = who;
$$;

create or replace function private.connected(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.connections c
     where least(c.requester, c.addressee) = least(a, b)
       and greatest(c.requester, c.addressee) = greatest(a, b)
       and c.status = 'accepted'
  ) and not private.network_blocked(a, b);
$$;

revoke execute on function private.connected(uuid, uuid) from public, anon, authenticated;

create or replace function private.user_by_name(name text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id from public.profiles p where p.username = lower(left(coalesce(name, ''), 40));
$$;

revoke execute on function private.user_by_name(text) from public, anon, authenticated;

create or replace function public.my_notifications()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
begin
  return jsonb_build_object(
    'unread', (
      select count(*) from public.notifications n
       where n.user_id = me and n.read_at is null
         and (n.actor is null or not private.network_blocked(me, n.actor))
    ),
    'items', coalesce((
      select jsonb_agg(x.item order by x.created_at desc)
        from (
          select n.created_at,
                 jsonb_build_object(
                   'id', n.id,
                   'kind', n.kind,
                   'ref', n.ref,
                   'at', n.created_at,
                   'read', n.read_at is not null,
                   'actor', case when n.actor is null then null else jsonb_build_object(
                     'username', p.username,
                     'name', coalesce(nullif(p.network_card ->> 'name', ''), p.display_name, p.username),
                     'color', p.network_card ->> 'color',
                     'art', p.network_card ->> 'art'
                   ) end
                 ) as item
            from public.notifications n
            left join public.profiles p on p.id = n.actor
           where n.user_id = me
             and (n.actor is null or not private.network_blocked(me, n.actor))
           order by n.created_at desc
           limit 30
        ) x
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.read_notifications()
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
begin
  update public.notifications set read_at = now() where user_id = me and read_at is null;
end;
$$;

create or replace function public.buddy_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
begin
  return jsonb_build_object(
    'active', (
      select private.network_face(case when b.requester = me then b.addressee else b.requester end)
             || jsonb_build_object('since', b.started_at)
        from public.buddies b
       where (b.requester = me or b.addressee = me) and b.status = 'active'
       limit 1
    ),
    'incoming', coalesce((
      select jsonb_agg(private.network_face(b.requester) || jsonb_build_object('since', b.created_at) order by b.created_at desc)
        from public.buddies b
       where b.addressee = me and b.status = 'pending'
         and private.network_member(b.requester) and not private.network_blocked(me, b.requester)
    ), '[]'::jsonb),
    'outgoing', (
      select jsonb_build_object('username', p.username, 'name', coalesce(nullif(p.network_card ->> 'name', ''), p.display_name), 'since', b.created_at)
        from public.buddies b
        join public.profiles p on p.id = b.addressee
       where b.requester = me and b.status = 'pending'
       limit 1
    )
  );
end;
$$;

create or replace function public.buddy_ask(name text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  other uuid := private.user_by_name(name);
  reverse_id bigint;
begin
  if other is null or other = me or not private.connected(me, other) or not private.network_member(other) then
    return jsonb_build_object('status', 'not_connected');
  end if;
  perform pg_advisory_xact_lock(hashtextextended('buddy:' || least(me, other)::text, 0));
  perform pg_advisory_xact_lock(hashtextextended('buddy:' || greatest(me, other)::text, 0));
  if exists (select 1 from public.buddies b where (b.requester = me or b.addressee = me) and b.status = 'active') then
    return jsonb_build_object('status', 'you_busy');
  end if;
  if exists (select 1 from public.buddies b where (b.requester = other or b.addressee = other) and b.status = 'active') then
    return jsonb_build_object('status', 'busy');
  end if;
  select b.id into reverse_id from public.buddies b where b.requester = other and b.addressee = me and b.status = 'pending';
  if reverse_id is not null then
    update public.buddies set status = 'active', started_at = now() where id = reverse_id;
    delete from public.buddies b
     where b.status = 'pending' and b.id <> reverse_id
       and (b.requester in (me, other) or b.addressee in (me, other));
    perform private.notify(other, me, 'buddy_accepted', null);
    return jsonb_build_object('status', 'active');
  end if;
  if not private.network_allow(me, 'buddy', 10) then
    return jsonb_build_object('status', 'limit');
  end if;
  delete from public.buddies b where b.requester = me and b.status = 'pending';
  insert into public.buddies (requester, addressee) values (me, other);
  perform private.notify(other, me, 'buddy_request', null);
  return jsonb_build_object('status', 'sent');
end;
$$;

create or replace function public.buddy_answer(name text, accept boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  other uuid := private.user_by_name(name);
  row_id bigint;
begin
  select b.id into row_id from public.buddies b where b.requester = other and b.addressee = me and b.status = 'pending';
  if row_id is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  if not accept then
    delete from public.buddies where id = row_id;
    return jsonb_build_object('status', 'declined');
  end if;
  perform pg_advisory_xact_lock(hashtextextended('buddy:' || least(me, other)::text, 0));
  perform pg_advisory_xact_lock(hashtextextended('buddy:' || greatest(me, other)::text, 0));
  if not private.connected(me, other) then
    delete from public.buddies where id = row_id;
    return jsonb_build_object('status', 'not_connected');
  end if;
  if exists (select 1 from public.buddies b where (b.requester in (me, other) or b.addressee in (me, other)) and b.status = 'active') then
    return jsonb_build_object('status', 'busy');
  end if;
  update public.buddies set status = 'active', started_at = now() where id = row_id;
  delete from public.buddies b
   where b.status = 'pending' and b.id <> row_id
     and (b.requester in (me, other) or b.addressee in (me, other));
  perform private.notify(other, me, 'buddy_accepted', null);
  return jsonb_build_object('status', 'active');
end;
$$;

create or replace function public.buddy_end()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  changed integer;
begin
  delete from public.buddies b where (b.requester = me or b.addressee = me) and (b.status = 'active' or b.requester = me);
  get diagnostics changed = row_count;
  return jsonb_build_object('status', case when changed = 0 then 'not_found' else 'ended' end);
end;
$$;

create or replace function private.group_code()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  alphabet constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
  raw bytea := extensions.gen_random_bytes(10);
  code text := '';
begin
  for j in 0..9 loop
    code := code || substr(alphabet, (get_byte(raw, j) % length(alphabet)) + 1, 1);
  end loop;
  return code;
end;
$$;

revoke execute on function private.group_code() from public, anon, authenticated;

create or replace function private.group_role(g uuid, who uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
           when exists (select 1 from public.study_groups s where s.id = g and s.owner = who) then 'owner'
           when exists (select 1 from public.group_members m where m.group_id = g and m.user_id = who and m.status = 'active') then 'member'
           when exists (select 1 from public.group_members m where m.group_id = g and m.user_id = who and m.status = 'pending') then 'pending'
           else 'none'
         end;
$$;

revoke execute on function private.group_role(uuid, uuid) from public, anon, authenticated;

create or replace function public.group_create(name text, about text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  clean_name text := trim(regexp_replace(coalesce(name, ''), '\s+', ' ', 'g'));
  clean_about text := trim(left(coalesce(about, ''), 200));
  new_id uuid;
  new_code text;
begin
  if not private.network_member(me) then
    raise exception 'not_member' using errcode = '42501';
  end if;
  if char_length(clean_name) < 3 or char_length(clean_name) > 60 then
    return jsonb_build_object('status', 'bad_name');
  end if;
  perform pg_advisory_xact_lock(hashtextextended('groups:' || me::text, 0));
  if (select count(*) from public.study_groups s where s.owner = me) >= 3 then
    return jsonb_build_object('status', 'too_many');
  end if;
  if (select count(*) from public.group_members m where m.user_id = me and m.status = 'active') >= 10 then
    return jsonb_build_object('status', 'too_many');
  end if;
  loop
    new_code := private.group_code();
    exit when not exists (select 1 from public.study_groups s where s.code = new_code);
  end loop;
  insert into public.study_groups (name, about, owner, code) values (clean_name, clean_about, me, new_code)
  returning id into new_id;
  insert into public.group_members (group_id, user_id, status, joined_at) values (new_id, me, 'active', now());
  return jsonb_build_object('status', 'created', 'id', new_id, 'code', new_code);
end;
$$;

create or replace function public.group_mine()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
begin
  return coalesce((
    select jsonb_agg(
             jsonb_build_object(
               'id', s.id,
               'name', s.name,
               'about', s.about,
               'role', case when s.owner = me then 'owner' when m.status = 'active' then 'member' else 'pending' end,
               'code', case when s.owner = me then s.code end,
               'count', (select count(*) from public.group_members x where x.group_id = s.id and x.status = 'active'),
               'members', case when m.status = 'active' then coalesce((
                 select jsonb_agg(private.network_face(x.user_id)
                                  || jsonb_build_object('owner', x.user_id = s.owner, 'me', x.user_id = me, 'since', x.joined_at)
                                  order by x.joined_at)
                   from public.group_members x
                  where x.group_id = s.id and x.status = 'active'
                    and (x.user_id = me or (private.network_member(x.user_id) and not private.network_blocked(me, x.user_id)))
               ), '[]'::jsonb) else '[]'::jsonb end,
               'pending', case when s.owner = me then coalesce((
                 select jsonb_agg(private.network_face(x.user_id) || jsonb_build_object('since', x.created_at) order by x.created_at)
                   from public.group_members x
                  where x.group_id = s.id and x.status = 'pending'
                    and private.network_member(x.user_id) and not private.network_blocked(me, x.user_id)
               ), '[]'::jsonb) else '[]'::jsonb end
             )
             order by s.created_at
           )
      from public.study_groups s
      join public.group_members m on m.group_id = s.id and m.user_id = me
  ), '[]'::jsonb);
end;
$$;

create or replace function public.group_preview(code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  g public.study_groups%rowtype;
begin
  if not private.network_allow(me, 'group_preview', 100) then
    return jsonb_build_object('status', 'limit');
  end if;
  select * into g from public.study_groups s where s.code = lower(left(coalesce(group_preview.code, ''), 20));
  if g.id is null or private.network_blocked(me, g.owner) then
    return jsonb_build_object('status', 'not_found');
  end if;
  return jsonb_build_object(
    'status', 'found',
    'id', g.id,
    'name', g.name,
    'about', g.about,
    'count', (select count(*) from public.group_members x where x.group_id = g.id and x.status = 'active'),
    'owner', (select coalesce(nullif(p.network_card ->> 'name', ''), p.display_name) from public.profiles p where p.id = g.owner),
    'mine', private.group_role(g.id, me),
    'member', private.network_member(me)
  );
end;
$$;

create or replace function public.group_join(code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  g public.study_groups%rowtype;
  my_role text;
begin
  if not private.network_member(me) then
    raise exception 'not_member' using errcode = '42501';
  end if;
  select * into g from public.study_groups s where s.code = lower(left(coalesce(group_join.code, ''), 20));
  if g.id is null or private.network_blocked(me, g.owner) then
    return jsonb_build_object('status', 'not_found');
  end if;
  my_role := private.group_role(g.id, me);
  if my_role in ('owner', 'member') then
    return jsonb_build_object('status', 'member', 'id', g.id);
  end if;
  if my_role = 'pending' then
    return jsonb_build_object('status', 'requested', 'id', g.id);
  end if;
  if (select count(*) from public.group_members x where x.group_id = g.id and x.status = 'active') >= 20 then
    return jsonb_build_object('status', 'full');
  end if;
  if (select count(*) from public.group_members m where m.user_id = me) >= 15 then
    return jsonb_build_object('status', 'too_many');
  end if;
  if not private.network_allow(me, 'group_join', 20) then
    return jsonb_build_object('status', 'limit');
  end if;
  insert into public.group_members (group_id, user_id) values (g.id, me);
  perform private.notify(g.owner, me, 'group_request', g.id::text);
  return jsonb_build_object('status', 'requested', 'id', g.id);
end;
$$;

create or replace function public.group_answer(group_id uuid, name text, accept boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  other uuid := private.user_by_name(name);
  changed integer;
begin
  if private.group_role(group_answer.group_id, me) <> 'owner' then
    return jsonb_build_object('status', 'not_owner');
  end if;
  perform pg_advisory_xact_lock(hashtextextended('group:' || group_answer.group_id::text, 0));
  if accept then
    if (select count(*) from public.group_members x where x.group_id = group_answer.group_id and x.status = 'active') >= 20 then
      return jsonb_build_object('status', 'full');
    end if;
    update public.group_members m set status = 'active', joined_at = now()
     where m.group_id = group_answer.group_id and m.user_id = other and m.status = 'pending';
  else
    delete from public.group_members m
     where m.group_id = group_answer.group_id and m.user_id = other and m.status = 'pending';
  end if;
  get diagnostics changed = row_count;
  if changed = 0 then
    return jsonb_build_object('status', 'not_found');
  end if;
  if accept then
    perform private.notify(other, me, 'group_joined', group_answer.group_id::text);
  end if;
  return jsonb_build_object('status', case when accept then 'added' else 'declined' end);
end;
$$;

create or replace function public.group_leave(group_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  heir uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended('group:' || group_leave.group_id::text, 0));
  if private.group_role(group_leave.group_id, me) = 'owner' then
    select m.user_id into heir from public.group_members m
     where m.group_id = group_leave.group_id and m.status = 'active' and m.user_id <> me
     order by m.joined_at
     limit 1;
    if heir is null then
      delete from public.study_groups s where s.id = group_leave.group_id;
      return jsonb_build_object('status', 'deleted');
    end if;
    update public.study_groups s set owner = heir where s.id = group_leave.group_id;
  end if;
  delete from public.group_members m where m.group_id = group_leave.group_id and m.user_id = me;
  return jsonb_build_object('status', 'left');
end;
$$;

create or replace function public.group_remove(group_id uuid, name text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  other uuid := private.user_by_name(name);
  changed integer;
begin
  if private.group_role(group_remove.group_id, me) <> 'owner' or other is null or other = me then
    return jsonb_build_object('status', 'not_owner');
  end if;
  delete from public.group_members m where m.group_id = group_remove.group_id and m.user_id = other;
  get diagnostics changed = row_count;
  return jsonb_build_object('status', case when changed = 0 then 'not_found' else 'removed' end);
end;
$$;

create or replace function public.group_edit(group_id uuid, name text, about text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  clean_name text := trim(regexp_replace(coalesce(name, ''), '\s+', ' ', 'g'));
begin
  if private.group_role(group_edit.group_id, me) <> 'owner' then
    return jsonb_build_object('status', 'not_owner');
  end if;
  if char_length(clean_name) < 3 or char_length(clean_name) > 60 then
    return jsonb_build_object('status', 'bad_name');
  end if;
  update public.study_groups s set name = clean_name, about = trim(left(coalesce(group_edit.about, ''), 200))
   where s.id = group_edit.group_id;
  return jsonb_build_object('status', 'saved');
end;
$$;

create or replace function public.group_new_code(group_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  new_code text;
begin
  if private.group_role(group_new_code.group_id, me) <> 'owner' then
    return jsonb_build_object('status', 'not_owner');
  end if;
  loop
    new_code := private.group_code();
    exit when not exists (select 1 from public.study_groups s where s.code = new_code);
  end loop;
  update public.study_groups s set code = new_code where s.id = group_new_code.group_id;
  return jsonb_build_object('status', 'saved', 'code', new_code);
end;
$$;

create or replace function public.group_delete(group_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
begin
  if private.group_role(group_delete.group_id, me) <> 'owner' then
    return jsonb_build_object('status', 'not_owner');
  end if;
  delete from public.study_groups s where s.id = group_delete.group_id;
  return jsonb_build_object('status', 'deleted');
end;
$$;

create or replace function private.peer_row(m public.peer_mocks, me uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', m.id,
    'at', m.at,
    'minutes', m.minutes,
    'topic', m.topic,
    'link', case when m.status in ('invited', 'accepted') then m.link end,
    'note', m.note,
    'status', m.status,
    'mine', m.host = me,
    'interviewer', m.interviewer = me,
    'score', case when m.interviewer = me or m.scored_at is not null then m.score end,
    'scored', m.scored_at is not null,
    'other', private.network_face(case when m.host = me then m.guest else m.host end)
  );
$$;

revoke execute on function private.peer_row(public.peer_mocks, uuid) from public, anon, authenticated;

create or replace function public.peer_invite(name text, at timestamptz, minutes integer, topic text, link text, interview_them boolean, note text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  other uuid := private.user_by_name(name);
  new_id uuid;
begin
  if other is null or other = me or not private.connected(me, other) or not private.network_member(other) then
    return jsonb_build_object('status', 'not_connected');
  end if;
  if peer_invite.at < now() + interval '10 minutes' or peer_invite.at > now() + interval '60 days' then
    return jsonb_build_object('status', 'bad_time');
  end if;
  if peer_invite.minutes is null or peer_invite.minutes not in (30, 45, 60) then
    return jsonb_build_object('status', 'bad_length');
  end if;
  if peer_invite.topic is null or peer_invite.topic not in ('javascript', 'react', 'frontend', 'backend', 'system-design', 'dsa', 'behavioural') then
    return jsonb_build_object('status', 'bad_topic');
  end if;
  if peer_invite.link is null or char_length(peer_invite.link) > 300
     or peer_invite.link !~ '^https://(meet\.google\.com|([a-z0-9-]+\.)?zoom\.us|teams\.microsoft\.com|teams\.live\.com|meet\.jit\.si|whereby\.com|discord\.gg|discord\.com)/[^\s<>"]*$' then
    return jsonb_build_object('status', 'bad_link');
  end if;
  if (select count(*) from public.peer_mocks m where m.host = me and m.status in ('invited', 'accepted') and m.at > now()) >= 20 then
    return jsonb_build_object('status', 'too_many');
  end if;
  if not private.network_allow(me, 'peer_invite', 10) then
    return jsonb_build_object('status', 'limit');
  end if;
  insert into public.peer_mocks (host, guest, interviewer, at, minutes, topic, link, note)
  values (me, other, case when interview_them then me else other end, peer_invite.at, peer_invite.minutes,
          peer_invite.topic, peer_invite.link, trim(left(coalesce(peer_invite.note, ''), 300)))
  returning id into new_id;
  perform private.notify(other, me, 'mock_invite', new_id::text);
  return jsonb_build_object('status', 'sent', 'id', new_id);
end;
$$;

create or replace function public.peer_answer(id uuid, accept boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  m public.peer_mocks%rowtype;
begin
  select * into m from public.peer_mocks x where x.id = peer_answer.id and x.guest = me and x.status = 'invited';
  if m.id is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  if accept and (m.at < now() or not private.connected(me, m.host)) then
    return jsonb_build_object('status', 'too_late');
  end if;
  update public.peer_mocks x set status = case when accept then 'accepted' else 'declined' end where x.id = m.id;
  perform private.notify(m.host, me, case when accept then 'mock_accepted' else 'mock_declined' end, m.id::text);
  return jsonb_build_object('status', case when accept then 'accepted' else 'declined' end);
end;
$$;

create or replace function public.peer_cancel(id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  m public.peer_mocks%rowtype;
begin
  select * into m from public.peer_mocks x
   where x.id = peer_cancel.id and (x.host = me or x.guest = me) and x.status in ('invited', 'accepted')
     and x.scored_at is null;
  if m.id is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  update public.peer_mocks x set status = 'cancelled' where x.id = m.id;
  perform private.notify(case when m.host = me then m.guest else m.host end, me, 'mock_cancelled', m.id::text);
  return jsonb_build_object('status', 'cancelled');
end;
$$;

create or replace function public.peer_list()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
begin
  return coalesce((
    select jsonb_agg(private.peer_row(m, me) order by m.at desc)
      from (
        select * from public.peer_mocks x
         where (x.host = me or x.guest = me)
           and x.at > now() - interval '60 days'
           and not private.network_blocked(x.host, x.guest)
         order by x.at desc
         limit 40
      ) m
  ), '[]'::jsonb);
end;
$$;

create or replace function public.peer_get(id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  m public.peer_mocks%rowtype;
begin
  select * into m from public.peer_mocks x where x.id = peer_get.id and (x.host = me or x.guest = me);
  if m.id is null or private.network_blocked(m.host, m.guest) then
    return null;
  end if;
  return private.peer_row(m, me);
end;
$$;

create or replace function public.peer_score(id uuid, score jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  m public.peer_mocks%rowtype;
begin
  select * into m from public.peer_mocks x
   where x.id = peer_score.id and x.interviewer = me and x.status = 'accepted';
  if m.id is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  if m.at > now() + interval '5 minutes' then
    return jsonb_build_object('status', 'too_early');
  end if;
  if peer_score.score is null or jsonb_typeof(peer_score.score) <> 'object' or octet_length(peer_score.score::text) > 4000 then
    return jsonb_build_object('status', 'bad_score');
  end if;
  update public.peer_mocks x set score = peer_score.score, scored_at = now() where x.id = m.id;
  perform private.notify(case when m.host = me then m.guest else m.host end, me, 'mock_scored', m.id::text);
  return jsonb_build_object('status', 'saved');
end;
$$;

revoke execute on function public.my_notifications() from public, anon;
revoke execute on function public.read_notifications() from public, anon;
revoke execute on function public.buddy_overview() from public, anon;
revoke execute on function public.buddy_ask(text) from public, anon;
revoke execute on function public.buddy_answer(text, boolean) from public, anon;
revoke execute on function public.buddy_end() from public, anon;
revoke execute on function public.group_create(text, text) from public, anon;
revoke execute on function public.group_mine() from public, anon;
revoke execute on function public.group_preview(text) from public, anon;
revoke execute on function public.group_join(text) from public, anon;
revoke execute on function public.group_answer(uuid, text, boolean) from public, anon;
revoke execute on function public.group_leave(uuid) from public, anon;
revoke execute on function public.group_remove(uuid, text) from public, anon;
revoke execute on function public.group_edit(uuid, text, text) from public, anon;
revoke execute on function public.group_new_code(uuid) from public, anon;
revoke execute on function public.group_delete(uuid) from public, anon;
revoke execute on function public.peer_invite(text, timestamptz, integer, text, text, boolean, text) from public, anon;
revoke execute on function public.peer_answer(uuid, boolean) from public, anon;
revoke execute on function public.peer_cancel(uuid) from public, anon;
revoke execute on function public.peer_list() from public, anon;
revoke execute on function public.peer_get(uuid) from public, anon;
revoke execute on function public.peer_score(uuid, jsonb) from public, anon;

grant execute on function public.my_notifications() to authenticated;
grant execute on function public.read_notifications() to authenticated;
grant execute on function public.buddy_overview() to authenticated;
grant execute on function public.buddy_ask(text) to authenticated;
grant execute on function public.buddy_answer(text, boolean) to authenticated;
grant execute on function public.buddy_end() to authenticated;
grant execute on function public.group_create(text, text) to authenticated;
grant execute on function public.group_mine() to authenticated;
grant execute on function public.group_preview(text) to authenticated;
grant execute on function public.group_join(text) to authenticated;
grant execute on function public.group_answer(uuid, text, boolean) to authenticated;
grant execute on function public.group_leave(uuid) to authenticated;
grant execute on function public.group_remove(uuid, text) to authenticated;
grant execute on function public.group_edit(uuid, text, text) to authenticated;
grant execute on function public.group_new_code(uuid) to authenticated;
grant execute on function public.group_delete(uuid) to authenticated;
grant execute on function public.peer_invite(text, timestamptz, integer, text, text, boolean, text) to authenticated;
grant execute on function public.peer_answer(uuid, boolean) to authenticated;
grant execute on function public.peer_cancel(uuid) to authenticated;
grant execute on function public.peer_list() to authenticated;
grant execute on function public.peer_get(uuid) to authenticated;
grant execute on function public.peer_score(uuid, jsonb) to authenticated;
