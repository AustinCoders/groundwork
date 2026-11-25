grant select on public.notifications to authenticated;

create policy "notifications: read own" on public.notifications
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "notifications: second step when enrolled" on public.notifications
  as restrictive for all to authenticated
  using ((select private.second_step_satisfied()));

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;

create or replace function private.network_me()
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
  if not (select private.second_step_satisfied()) then
    raise exception 'second_step' using errcode = '42501';
  end if;
  if not exists (
    select 1 from auth.users u
     where u.id = caller
       and (u.banned_until is null or u.banned_until < now())
       and u.deleted_at is null
       and (u.email_confirmed_at is not null or u.phone_confirmed_at is not null)
  ) then
    raise exception 'unconfirmed' using errcode = '42501';
  end if;
  return caller;
end;
$$;

create or replace function private.notify_connection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    if tg_op = 'INSERT' and new.status = 'pending' then
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

create or replace function private.new_account(who uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from auth.users u where u.id = who and u.created_at > now() - interval '24 hours');
$$;

revoke execute on function private.new_account(uuid) from public, anon, authenticated;

create or replace function public.network_request(name text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  target uuid;
  existing_id bigint;
  existing_status text;
  existing_requester uuid;
  mine integer;
begin
  if not private.network_member(me) then
    raise exception 'not_member' using errcode = '42501';
  end if;
  target := private.network_user(name);
  if target is null or private.network_blocked(me, target) then
    return jsonb_build_object('status', 'not_found');
  end if;
  if target = me then
    return jsonb_build_object('status', 'self');
  end if;
  perform pg_advisory_xact_lock(hashtextextended('pair:' || least(me, target)::text || greatest(me, target)::text, 0));
  select c.id, c.status, c.requester into existing_id, existing_status, existing_requester
    from public.connections c
   where least(c.requester, c.addressee) = least(me, target)
     and greatest(c.requester, c.addressee) = greatest(me, target);
  if found then
    if existing_status = 'accepted' then
      return jsonb_build_object('status', 'connected');
    elsif existing_requester = me then
      return jsonb_build_object('status', 'sent');
    else
      update public.connections set status = 'accepted', responded_at = now() where id = existing_id;
      return jsonb_build_object('status', 'connected');
    end if;
  end if;
  select count(*) into mine from public.connections c where c.requester = me or c.addressee = me;
  if mine >= 500 then
    return jsonb_build_object('status', 'full');
  end if;
  if not private.network_allow(me, 'request', case when private.new_account(me) then 5 else 20 end) then
    return jsonb_build_object('status', 'limit');
  end if;
  insert into public.connections (requester, addressee) values (me, target);
  return jsonb_build_object('status', 'sent');
end;
$$;

alter table public.study_groups
  add column goal integer not null default 0 check (goal between 0 and 5000);

create or replace function public.group_set_goal(group_id uuid, goal integer)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
begin
  if private.group_role(group_set_goal.group_id, me) <> 'owner' then
    return jsonb_build_object('status', 'not_owner');
  end if;
  if group_set_goal.goal is null or group_set_goal.goal < 0 or group_set_goal.goal > 5000 then
    return jsonb_build_object('status', 'bad_goal');
  end if;
  update public.study_groups s set goal = group_set_goal.goal where s.id = group_set_goal.group_id;
  return jsonb_build_object('status', 'saved');
end;
$$;

create table public.group_races (
  id uuid primary key default gen_random_uuid(),
  week date not null,
  challenger uuid not null references public.study_groups (id) on delete cascade,
  opponent uuid not null references public.study_groups (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  check (challenger <> opponent)
);

create unique index group_races_pair on public.group_races (week, least(challenger, opponent), greatest(challenger, opponent));
create index group_races_challenger on public.group_races (challenger, week);
create index group_races_opponent on public.group_races (opponent, week);

alter table public.group_races enable row level security;
revoke all on public.group_races from public, anon, authenticated;

create or replace function private.race_week()
returns date
language sql
stable
set search_path = ''
as $$
  select (date_trunc('week', now() at time zone 'Asia/Kolkata'))::date;
$$;

revoke execute on function private.race_week() from public, anon, authenticated;

create or replace function public.race_invite(group_id uuid, code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  other public.study_groups%rowtype;
  this_week date := private.race_week();
  new_id uuid;
begin
  if private.group_role(race_invite.group_id, me) <> 'owner' then
    return jsonb_build_object('status', 'not_owner');
  end if;
  select * into other from public.study_groups s where s.code = lower(left(coalesce(race_invite.code, ''), 20));
  if other.id is null or other.id = race_invite.group_id or private.network_blocked(me, other.owner) then
    return jsonb_build_object('status', 'not_found');
  end if;
  if exists (
    select 1 from public.group_races r
     where r.week = this_week and r.status <> 'declined'
       and (r.challenger in (race_invite.group_id, other.id) or r.opponent in (race_invite.group_id, other.id))
  ) then
    return jsonb_build_object('status', 'busy');
  end if;
  if not private.network_allow(me, 'race', 5) then
    return jsonb_build_object('status', 'limit');
  end if;
  insert into public.group_races (week, challenger, opponent) values (this_week, race_invite.group_id, other.id)
  returning id into new_id;
  perform private.notify(other.owner, me, 'race_invite', other.id::text);
  return jsonb_build_object('status', 'sent', 'id', new_id);
end;
$$;

create or replace function public.race_answer(race_id uuid, accept boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  r public.group_races%rowtype;
  challenger_owner uuid;
begin
  select * into r from public.group_races x where x.id = race_answer.race_id and x.status = 'pending';
  if r.id is null or private.group_role(r.opponent, me) <> 'owner' then
    return jsonb_build_object('status', 'not_found');
  end if;
  update public.group_races x set status = case when accept then 'accepted' else 'declined' end where x.id = r.id;
  select s.owner into challenger_owner from public.study_groups s where s.id = r.challenger;
  if accept then
    perform private.notify(challenger_owner, me, 'race_accepted', r.challenger::text);
  end if;
  return jsonb_build_object('status', case when accept then 'accepted' else 'declined' end);
end;
$$;

create or replace function private.race_side(g uuid, named boolean, me uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'members', coalesce((
      select jsonb_agg(
               case when named then jsonb_build_object(
                 'username', p.username,
                 'name', coalesce(nullif(p.network_card ->> 'name', ''), p.display_name),
                 'heat', p.network_card -> 'heat',
                 'heatEnd', p.network_card -> 'heatEnd',
                 'me', m.user_id = me
               ) else jsonb_build_object(
                 'heat', p.network_card -> 'heat',
                 'heatEnd', p.network_card -> 'heatEnd'
               ) end
             )
        from public.group_members m
        join public.profiles p on p.id = m.user_id
       where m.group_id = s.id and m.status = 'active' and p.network_on
    ), '[]'::jsonb)
  )
    from public.study_groups s
   where s.id = g;
$$;

revoke execute on function private.race_side(uuid, boolean, uuid) from public, anon, authenticated;

create or replace function public.race_board(group_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
begin
  if private.group_role(race_board.group_id, me) not in ('owner', 'member') then
    return '[]'::jsonb;
  end if;
  return coalesce((
    select jsonb_agg(
             jsonb_build_object(
               'id', r.id,
               'week', r.week,
               'status', r.status,
               'incoming', r.opponent = race_board.group_id and r.status = 'pending',
               'us', private.race_side(race_board.group_id, true, me),
               'them', case when r.status = 'accepted'
                            then private.race_side(case when r.challenger = race_board.group_id then r.opponent else r.challenger end, false, me)
                            else jsonb_build_object('name', (
                              select s.name from public.study_groups s
                               where s.id = case when r.challenger = race_board.group_id then r.opponent else r.challenger end
                            ), 'members', '[]'::jsonb) end
             )
             order by r.week desc
           )
      from public.group_races r
     where (r.challenger = race_board.group_id or r.opponent = race_board.group_id)
       and r.status <> 'declined'
       and r.week >= private.race_week() - 7
  ), '[]'::jsonb);
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
               'goal', s.goal,
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

alter table public.profiles
  add column feed_off text[] not null default '{}' check (cardinality(feed_off) <= 10),
  add column mentor boolean not null default false,
  add column mentor_note text not null default '' check (char_length(mentor_note) <= 120),
  add column invite_code text unique check (invite_code is null or invite_code ~ '^[a-z0-9]{10}$');

grant update (feed_off, mentor, mentor_note) on public.profiles to authenticated;

create table public.feed_posts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('topic', 'streak', 'level', 'challenge', 'badge')),
  data jsonb not null default '{}' check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 400),
  created_at timestamptz not null default now()
);

create index feed_posts_user on public.feed_posts (user_id, created_at desc);

alter table public.feed_posts enable row level security;
revoke all on public.feed_posts from public, anon, authenticated;

create or replace function public.feed_post(kind text, data jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
begin
  if not private.network_member(me) then
    return jsonb_build_object('status', 'not_member');
  end if;
  if feed_post.kind is null or feed_post.kind not in ('topic', 'streak', 'level', 'challenge', 'badge') then
    return jsonb_build_object('status', 'bad_kind');
  end if;
  if feed_post.data is null or jsonb_typeof(feed_post.data) <> 'object' or octet_length(feed_post.data::text) > 400 then
    return jsonb_build_object('status', 'bad_data');
  end if;
  if exists (select 1 from public.profiles p where p.id = me and feed_post.kind = any (p.feed_off)) then
    return jsonb_build_object('status', 'off');
  end if;
  if exists (
    select 1 from public.feed_posts f
     where f.user_id = me and f.kind = feed_post.kind and f.data = feed_post.data
       and f.created_at > now() - interval '30 days'
  ) then
    return jsonb_build_object('status', 'already');
  end if;
  if not private.network_allow(me, 'feed', 20) then
    return jsonb_build_object('status', 'limit');
  end if;
  insert into public.feed_posts (user_id, kind, data) values (me, feed_post.kind, feed_post.data);
  delete from public.feed_posts f where f.user_id = me and f.created_at < now() - interval '60 days';
  return jsonb_build_object('status', 'posted');
end;
$$;

create or replace function public.network_feed()
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
    select jsonb_agg(x.item order by x.created_at desc)
      from (
        select f.created_at,
               jsonb_build_object(
                 'id', f.id,
                 'kind', f.kind,
                 'data', f.data,
                 'at', f.created_at,
                 'me', f.user_id = me,
                 'who', jsonb_build_object(
                   'username', p.username,
                   'name', coalesce(nullif(p.network_card ->> 'name', ''), p.display_name),
                   'color', p.network_card ->> 'color',
                   'art', p.network_card ->> 'art'
                 )
               ) as item
          from public.feed_posts f
          join public.profiles p on p.id = f.user_id
         where f.created_at > now() - interval '14 days'
           and p.network_on
           and not (f.kind = any (p.feed_off))
           and (f.user_id = me or private.connected(me, f.user_id))
         order by f.created_at desc
         limit 50
      ) x
  ), '[]'::jsonb);
end;
$$;

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
    'mentor', p.mentor,
    'mentorNote', case when p.mentor then p.mentor_note else '' end,
    'at', p.network_at
  )
    from public.profiles p
   where p.id = who;
$$;

create or replace function public.network_mentors()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
begin
  if not private.network_member(me) then
    return '[]'::jsonb;
  end if;
  return coalesce((
    select jsonb_agg(x.item order by x.level desc nulls last, x.at desc nulls last)
      from (
        select private.network_face(p.id) || jsonb_build_object('relation',
                 coalesce((
                   select case when c.status = 'accepted' then 'connected' when c.requester = me then 'sent' else 'received' end
                     from public.connections c
                    where least(c.requester, c.addressee) = least(me, p.id)
                      and greatest(c.requester, c.addressee) = greatest(me, p.id)
                 ), 'none')) as item,
               case when jsonb_typeof(p.network_card -> 'level') = 'number' then (p.network_card ->> 'level')::numeric end as level,
               p.network_at as at
          from public.profiles p
         where p.network_on and p.mentor and p.discoverable and p.id <> me
           and not private.network_blocked(me, p.id)
         order by p.network_at desc nulls last
         limit 30
      ) x
  ), '[]'::jsonb);
end;
$$;

create or replace function public.network_invite_code(fresh boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  current_code text;
begin
  if not private.network_member(me) then
    return jsonb_build_object('status', 'not_member');
  end if;
  select p.invite_code into current_code from public.profiles p where p.id = me;
  if current_code is null or fresh then
    loop
      current_code := private.group_code();
      exit when not exists (select 1 from public.profiles p where p.invite_code = current_code);
    end loop;
    update public.profiles p set invite_code = current_code where p.id = me;
  end if;
  return jsonb_build_object('status', 'ok', 'code', current_code);
end;
$$;

create or replace function public.network_redeem(code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  inviter uuid;
  existing_id bigint;
  existing_status text;
begin
  if not private.network_member(me) then
    return jsonb_build_object('status', 'not_member');
  end if;
  select p.id into inviter from public.profiles p
   where p.invite_code = lower(left(coalesce(network_redeem.code, ''), 20)) and p.network_on;
  if inviter is null or private.network_blocked(me, inviter) then
    return jsonb_build_object('status', 'not_found');
  end if;
  if inviter = me then
    return jsonb_build_object('status', 'self');
  end if;
  if not private.network_allow(me, 'redeem', 5) then
    return jsonb_build_object('status', 'limit');
  end if;
  perform pg_advisory_xact_lock(hashtextextended('pair:' || least(me, inviter)::text || greatest(me, inviter)::text, 0));
  select c.id, c.status into existing_id, existing_status
    from public.connections c
   where least(c.requester, c.addressee) = least(me, inviter)
     and greatest(c.requester, c.addressee) = greatest(me, inviter);
  if existing_id is null then
    insert into public.connections (requester, addressee, status, responded_at) values (inviter, me, 'accepted', now());
  elsif existing_status <> 'accepted' then
    update public.connections set status = 'accepted', responded_at = now() where id = existing_id;
  else
    return jsonb_build_object('status', 'connected', 'name', (select p.username from public.profiles p where p.id = inviter));
  end if;
  perform private.notify(inviter, me, 'invite_joined', null);
  return jsonb_build_object('status', 'connected', 'name', (select p.username from public.profiles p where p.id = inviter));
end;
$$;

create or replace function public.invite_preview(code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select jsonb_build_object(
             'name', coalesce(nullif(p.network_card ->> 'name', ''), p.display_name),
             'color', p.network_card ->> 'color',
             'art', p.network_card ->> 'art',
             'level', p.network_card -> 'level'
           )
      from public.profiles p
     where p.invite_code = lower(left(coalesce(code, ''), 20)) and p.network_on
  ), jsonb_build_object('name', null));
$$;

alter table public.reports
  add column resolved_at timestamptz,
  add column resolution text check (resolution is null or resolution in ('dismissed', 'warned', 'suspended')),
  add column resolved_by uuid references auth.users (id) on delete set null;

create table private.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

create table private.admin_log (
  id bigint generated always as identity primary key,
  admin uuid references auth.users (id) on delete set null,
  action text not null,
  target uuid,
  detail text not null default '',
  at timestamptz not null default now()
);

alter table private.admins enable row level security;
alter table private.admin_log enable row level security;
revoke all on private.admins, private.admin_log from public, anon, authenticated;

insert into private.admins (user_id)
select u.id from auth.users u
 where lower(u.email) in ('akshataustin4321@gmail.com', 'vinitpoojary00@gmail.com')
on conflict do nothing;

create or replace function private.admin_me()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := private.network_me();
begin
  if not exists (select 1 from private.admins a where a.user_id = caller) then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  if coalesce((select auth.jwt()) ->> 'aal', 'aal1') <> 'aal2' then
    raise exception 'admin_two_step' using errcode = '42501';
  end if;
  return caller;
end;
$$;

revoke execute on function private.admin_me() from public, anon, authenticated;

create or replace function public.am_i_admin()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  return jsonb_build_object(
    'admin', exists (select 1 from private.admins a where a.user_id = caller),
    'two_step', coalesce((select auth.jwt()) ->> 'aal', 'aal1') = 'aal2'
  );
end;
$$;

create or replace function public.admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := private.admin_me();
begin
  return jsonb_build_object(
    'stats', jsonb_build_object(
      'users', (select count(*) from auth.users),
      'new_week', (select count(*) from auth.users u where u.created_at > now() - interval '7 days'),
      'members', (select count(*) from public.profiles p where p.network_on),
      'groups', (select count(*) from public.study_groups),
      'mocks', (select count(*) from public.peer_mocks m where m.status = 'accepted'),
      'open_reports', (select count(*) from public.reports r where r.resolved_at is null),
      'suspended', (select count(*) from auth.users u where u.banned_until > now())
    ),
    'reports', coalesce((
      select jsonb_agg(x.item order by x.created_at desc)
        from (
          select r.created_at,
                 jsonb_build_object(
                   'id', r.id,
                   'at', r.created_at,
                   'reason', r.reason,
                   'note', r.note,
                   'resolved', r.resolved_at is not null,
                   'resolution', r.resolution,
                   'reporter', jsonb_build_object('username', rp.username, 'name', rp.display_name),
                   'reported', jsonb_build_object(
                     'id', r.reported,
                     'username', tp.username,
                     'name', tp.display_name,
                     'headline', coalesce(tp.network_card ->> 'headline', ''),
                     'joined', tu.created_at,
                     'reports', (select count(*) from public.reports z where z.reported = r.reported),
                     'suspended_until', case when tu.banned_until > now() then tu.banned_until end
                   )
                 ) as item
            from public.reports r
            left join public.profiles rp on rp.id = r.reporter
            left join public.profiles tp on tp.id = r.reported
            left join auth.users tu on tu.id = r.reported
           order by r.resolved_at is not null, r.created_at desc
           limit 100
        ) x
    ), '[]'::jsonb),
    'suspended', coalesce((
      select jsonb_agg(jsonb_build_object('id', u.id, 'username', p.username, 'name', p.display_name, 'until', u.banned_until) order by u.banned_until)
        from auth.users u
        left join public.profiles p on p.id = u.id
       where u.banned_until > now()
    ), '[]'::jsonb),
    'log', coalesce((
      select jsonb_agg(jsonb_build_object('action', l.action, 'detail', l.detail, 'at', l.at,
                                          'admin', (select p.display_name from public.profiles p where p.id = l.admin))
                       order by l.at desc)
        from (select * from private.admin_log order by at desc limit 30) l
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.admin_resolve(report_id bigint, resolution text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.admin_me();
  target uuid;
begin
  if admin_resolve.resolution not in ('dismissed', 'warned', 'suspended') then
    return jsonb_build_object('status', 'bad_resolution');
  end if;
  update public.reports r
     set resolved_at = now(), resolution = admin_resolve.resolution, resolved_by = me
   where r.id = admin_resolve.report_id
  returning r.reported into target;
  if target is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  insert into private.admin_log (admin, action, target, detail)
  values (me, 'resolve', target, admin_resolve.resolution || ' report ' || admin_resolve.report_id);
  return jsonb_build_object('status', 'saved');
end;
$$;

create or replace function public.admin_suspend(target uuid, days integer, reason text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.admin_me();
begin
  if target is null or target = me or exists (select 1 from private.admins a where a.user_id = target) then
    return jsonb_build_object('status', 'not_allowed');
  end if;
  if admin_suspend.days is null or admin_suspend.days < 0 or admin_suspend.days > 365 then
    return jsonb_build_object('status', 'bad_days');
  end if;
  if not exists (select 1 from auth.users u where u.id = target) then
    return jsonb_build_object('status', 'not_found');
  end if;
  if admin_suspend.days = 0 then
    update auth.users u set banned_until = null where u.id = target;
  else
    update auth.users u set banned_until = now() + make_interval(days => admin_suspend.days) where u.id = target;
    delete from auth.sessions s where s.user_id = target;
  end if;
  insert into private.admin_log (admin, action, target, detail)
  values (me, case when admin_suspend.days = 0 then 'lift' else 'suspend' end, target,
          case when admin_suspend.days = 0 then 'lifted' else admin_suspend.days || ' days: ' end || left(coalesce(admin_suspend.reason, ''), 200));
  return jsonb_build_object('status', case when admin_suspend.days = 0 then 'lifted' else 'suspended' end);
end;
$$;

create table public.push_subs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique check (endpoint ~ '^https://' and char_length(endpoint) <= 800),
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  tz text not null default 'Asia/Kolkata' check (char_length(tz) <= 60),
  mocks boolean not null default true,
  goal boolean not null default true,
  news boolean not null default true,
  goal_sent date,
  created_at timestamptz not null default now(),
  failed integer not null default 0
);

create index push_subs_user on public.push_subs (user_id);

alter table public.push_subs enable row level security;
revoke all on public.push_subs from public, anon, authenticated;

alter table public.peer_mocks add column reminded_at timestamptz;
alter table public.notifications add column pushed_at timestamptz;

create or replace function public.push_save(endpoint text, p256dh text, auth text, tz text, mocks boolean, goal boolean, news boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  zone text := coalesce(nullif(push_save.tz, ''), 'Asia/Kolkata');
begin
  if push_save.endpoint is null or push_save.endpoint !~ '^https://' or char_length(push_save.endpoint) > 800
     or push_save.p256dh is null or char_length(push_save.p256dh) > 200
     or push_save.auth is null or char_length(push_save.auth) > 100 then
    return jsonb_build_object('status', 'bad_subscription');
  end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names z where z.name = zone) then
    zone := 'Asia/Kolkata';
  end if;
  if (select count(*) from public.push_subs s where s.user_id = me and s.endpoint <> push_save.endpoint) >= 5 then
    delete from public.push_subs s
     where s.id = (select x.id from public.push_subs x where x.user_id = me order by x.created_at limit 1);
  end if;
  insert into public.push_subs (user_id, endpoint, p256dh, auth, tz, mocks, goal, news)
  values (me, push_save.endpoint, push_save.p256dh, push_save.auth, zone,
          coalesce(push_save.mocks, true), coalesce(push_save.goal, true), coalesce(push_save.news, true))
  on conflict on constraint push_subs_endpoint_key do update
     set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, tz = excluded.tz,
         mocks = excluded.mocks, goal = excluded.goal, news = excluded.news, failed = 0;
  return jsonb_build_object('status', 'saved');
end;
$$;

create or replace function public.push_drop(endpoint text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
begin
  delete from public.push_subs s where s.endpoint = push_drop.endpoint and s.user_id = me;
  return jsonb_build_object('status', 'dropped');
end;
$$;

create or replace function public.push_get(endpoint text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select jsonb_build_object('mocks', s.mocks, 'goal', s.goal, 'news', s.news)
      from public.push_subs s
     where s.endpoint = push_get.endpoint and s.user_id = (select auth.uid())
  ), 'null'::jsonb);
$$;

revoke execute on function public.group_set_goal(uuid, integer) from public, anon;
revoke execute on function public.race_invite(uuid, text) from public, anon;
revoke execute on function public.race_answer(uuid, boolean) from public, anon;
revoke execute on function public.race_board(uuid) from public, anon;
revoke execute on function public.feed_post(text, jsonb) from public, anon;
revoke execute on function public.network_feed() from public, anon;
revoke execute on function public.network_mentors() from public, anon;
revoke execute on function public.network_invite_code(boolean) from public, anon;
revoke execute on function public.network_redeem(text) from public, anon;
revoke execute on function public.invite_preview(text) from public;
revoke execute on function public.am_i_admin() from public, anon;
revoke execute on function public.admin_overview() from public, anon;
revoke execute on function public.admin_resolve(bigint, text) from public, anon;
revoke execute on function public.admin_suspend(uuid, integer, text) from public, anon;
revoke execute on function public.push_save(text, text, text, text, boolean, boolean, boolean) from public, anon;
revoke execute on function public.push_drop(text) from public, anon;
revoke execute on function public.push_get(text) from public, anon;

grant execute on function public.group_set_goal(uuid, integer) to authenticated;
grant execute on function public.race_invite(uuid, text) to authenticated;
grant execute on function public.race_answer(uuid, boolean) to authenticated;
grant execute on function public.race_board(uuid) to authenticated;
grant execute on function public.feed_post(text, jsonb) to authenticated;
grant execute on function public.network_feed() to authenticated;
grant execute on function public.network_mentors() to authenticated;
grant execute on function public.network_invite_code(boolean) to authenticated;
grant execute on function public.network_redeem(text) to authenticated;
grant execute on function public.invite_preview(text) to anon, authenticated;
grant execute on function public.am_i_admin() to authenticated;
grant execute on function public.admin_overview() to authenticated;
grant execute on function public.admin_resolve(bigint, text) to authenticated;
grant execute on function public.admin_suspend(uuid, integer, text) to authenticated;
grant execute on function public.push_save(text, text, text, text, boolean, boolean, boolean) to authenticated;
grant execute on function public.push_drop(text) to authenticated;
grant execute on function public.push_get(text) to authenticated;

create or replace function public.push_jobs()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  jobs jsonb := '[]'::jsonb;
  mock_ids uuid[];
  note_ids bigint[];
  goal_ids bigint[];
begin
  select coalesce(array_agg(m.id), '{}') into mock_ids
    from public.peer_mocks m
   where m.status = 'accepted' and m.reminded_at is null
     and m.at between now() + interval '5 minutes' and now() + interval '20 minutes';

  jobs := jobs || coalesce((
    select jsonb_agg(jsonb_build_object(
             'endpoint', s.endpoint, 'p256dh', s.p256dh, 'auth', s.auth,
             'title', 'Mock interview in ' || greatest(1, round(extract(epoch from (m.at - now())) / 60))::int || ' minutes',
             'body', 'With ' || coalesce(nullif(o.network_card ->> 'name', ''), o.display_name, 'your friend') || '. Open it to join the call.',
             'url', '/mock/peer/' || m.id,
             'tag', 'mock-' || m.id))
      from public.peer_mocks m
      join public.push_subs s on s.user_id in (m.host, m.guest) and s.mocks
      join public.profiles o on o.id = case when s.user_id = m.host then m.guest else m.host end
     where m.id = any (mock_ids)
  ), '[]'::jsonb);
  update public.peer_mocks m set reminded_at = now() where m.id = any (mock_ids);

  select coalesce(array_agg(n.id), '{}') into note_ids
    from public.notifications n
   where n.pushed_at is null and n.read_at is null
     and n.created_at > now() - interval '30 minutes'
     and n.kind in ('request', 'buddy_request', 'group_request', 'mock_invite', 'mock_accepted', 'mock_scored',
                    'mock_cancelled', 'race_invite', 'invite_joined', 'group_joined', 'buddy_accepted', 'cheer_nudge');

  jobs := jobs || coalesce((
    select jsonb_agg(jsonb_build_object(
             'endpoint', s.endpoint, 'p256dh', s.p256dh, 'auth', s.auth,
             'title', 'Groundwork',
             'body', coalesce(nullif(a.network_card ->> 'name', ''), a.display_name, 'Someone') || ' ' ||
                     case n.kind
                       when 'request' then 'wants to connect'
                       when 'buddy_request' then 'asked you to be study buddies'
                       when 'group_request' then 'wants to join your study group'
                       when 'mock_invite' then 'invited you to a mock interview'
                       when 'mock_accepted' then 'accepted your mock interview'
                       when 'mock_scored' then 'sent your mock interview feedback'
                       when 'mock_cancelled' then 'cancelled a mock interview'
                       when 'race_invite' then 'challenged your group to a race'
                       when 'invite_joined' then 'joined with your invite link'
                       when 'group_joined' then 'added you to a study group'
                       when 'buddy_accepted' then 'is your study buddy now'
                       else 'nudged you to study today'
                     end,
             'url', case
                      when n.kind like 'mock%' and n.ref is not null then '/mock/peer/' || n.ref
                      when (n.kind like 'group%' or n.kind like 'race%') and n.ref is not null then '/groups#group-' || n.ref
                      else '/people'
                    end,
             'tag', 'note-' || n.id))
      from public.notifications n
      join public.push_subs s on s.user_id = n.user_id and s.news
      left join public.profiles a on a.id = n.actor
     where n.id = any (note_ids)
  ), '[]'::jsonb);
  update public.notifications n set pushed_at = now() where n.id = any (note_ids);

  select coalesce(array_agg(s.id), '{}') into goal_ids
    from public.push_subs s
   where s.goal
     and extract(hour from now() at time zone s.tz) = 19
     and (s.goal_sent is null or s.goal_sent < (now() at time zone s.tz)::date);

  jobs := jobs || coalesce((
    select jsonb_agg(jsonb_build_object(
             'endpoint', x.endpoint, 'p256dh', x.p256dh, 'auth', x.auth,
             'title', case when x.done = 0 then 'Nothing done today yet' else x.done || ' of ' || x.goal || ' today' end,
             'body', (x.goal - x.done) || ' more to hit your daily goal and keep your streak.',
             'url', '/progress',
             'tag', 'goal'))
      from (
        select s.endpoint, s.p256dh, s.auth,
               coalesce((select case when jsonb_typeof(st.value -> to_char((now() at time zone s.tz)::date, 'YYYY-MM-DD')) = 'number'
                                     then (st.value ->> to_char((now() at time zone s.tz)::date, 'YYYY-MM-DD'))::int end
                           from public.user_state st where st.user_id = s.user_id and st.key = 'jsnotes:activity'), 0) as done,
               coalesce((select case when st.value ->> 'goal' in ('1', '3', '5', '8') then (st.value ->> 'goal')::int end
                           from public.user_state st where st.user_id = s.user_id and st.key = 'groundwork:plan'), 3) as goal
          from public.push_subs s
         where s.id = any (goal_ids)
      ) x
     where x.done < x.goal
  ), '[]'::jsonb);
  update public.push_subs s set goal_sent = (now() at time zone s.tz)::date where s.id = any (goal_ids);

  return jobs;
end;
$$;

create or replace function public.push_dead(endpoints text[], gone boolean)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if gone then
    delete from public.push_subs s where s.endpoint = any (endpoints);
  else
    update public.push_subs s set failed = s.failed + 1 where s.endpoint = any (endpoints);
    delete from public.push_subs s where s.endpoint = any (endpoints) and s.failed >= 10;
  end if;
end;
$$;

revoke execute on function public.push_jobs() from public, anon, authenticated;
revoke execute on function public.push_dead(text[], boolean) from public, anon, authenticated;
grant execute on function public.push_jobs() to service_role;
grant execute on function public.push_dead(text[], boolean) to service_role;
