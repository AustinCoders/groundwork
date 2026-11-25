alter table public.profiles
  add column network_on boolean not null default false,
  add column discoverable boolean not null default true,
  add column network_card jsonb,
  add column network_at timestamptz;

alter table public.profiles
  add constraint profiles_network_card_shape
    check (network_card is null or (jsonb_typeof(network_card) = 'object' and octet_length(network_card::text) <= 24000)),
  add constraint profiles_network_needs_username
    check (not network_on or username is not null);

create or replace function private.guard_profile_network()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.network_card is distinct from old.network_card then
    new.network_at := case when new.network_card is null then null else now() end;
  end if;
  if not new.network_on and old.network_on then
    new.network_card := null;
    new.network_at := null;
  end if;
  return new;
end;
$$;

revoke execute on function private.guard_profile_network() from public, anon, authenticated;

create trigger profiles_guard_network before update on public.profiles
  for each row execute function private.guard_profile_network();

grant update (network_on, discoverable, network_card) on public.profiles to authenticated;

create table public.connections (
  id bigint generated always as identity primary key,
  requester uuid not null references auth.users (id) on delete cascade,
  addressee uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester <> addressee)
);

create unique index connections_pair on public.connections (least(requester, addressee), greatest(requester, addressee));
create index connections_addressee on public.connections (addressee, status);
create index connections_requester on public.connections (requester, status);

create table public.blocks (
  blocker uuid not null references auth.users (id) on delete cascade,
  blocked uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);

create index blocks_blocked on public.blocks (blocked);

create table public.reports (
  id bigint generated always as identity primary key,
  reporter uuid not null references auth.users (id) on delete cascade,
  reported uuid not null references auth.users (id) on delete cascade,
  reason text not null check (reason in ('spam', 'harassment', 'fake', 'inappropriate', 'other')),
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

create table public.cheers (
  id bigint generated always as identity primary key,
  sender uuid not null references auth.users (id) on delete cascade,
  receiver uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('clap', 'fire', 'nudge')),
  created_at timestamptz not null default now(),
  seen boolean not null default false
);

create index cheers_receiver on public.cheers (receiver, created_at desc);
create index cheers_pair on public.cheers (sender, receiver, kind, created_at desc);

create table private.network_log (
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  at timestamptz not null default now()
);

create index network_log_user on private.network_log (user_id, kind, at);

alter table public.connections enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.cheers enable row level security;
alter table private.network_log enable row level security;

revoke all on public.connections, public.blocks, public.reports, public.cheers from public, anon, authenticated;
revoke all on private.network_log from public, anon, authenticated;

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
       and u.banned_until is null
       and u.deleted_at is null
       and (u.email_confirmed_at is not null or u.phone_confirmed_at is not null)
  ) then
    raise exception 'unconfirmed' using errcode = '42501';
  end if;
  return caller;
end;
$$;

create or replace function private.network_member(who uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id = who and p.network_on and p.username is not null);
$$;

create or replace function private.network_user(name text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id from public.profiles p
   where p.username = lower(left(coalesce(name, ''), 40))
     and p.network_on;
$$;

create or replace function private.network_blocked(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.blocks k
     where (k.blocker = a and k.blocked = b) or (k.blocker = b and k.blocked = a)
  );
$$;

create or replace function private.network_allow(who uuid, what text, per_day integer)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  used integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('network:' || who::text || ':' || what, 0));
  delete from private.network_log l where l.user_id = who and l.at < now() - interval '2 days';
  select count(*) into used from private.network_log l
   where l.user_id = who and l.kind = what and l.at > now() - interval '1 day';
  if used >= per_day then
    return false;
  end if;
  insert into private.network_log (user_id, kind) values (who, what);
  return true;
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
    'at', p.network_at
  )
    from public.profiles p
   where p.id = who;
$$;

revoke execute on function private.network_me() from public, anon, authenticated;
revoke execute on function private.network_member(uuid) from public, anon, authenticated;
revoke execute on function private.network_user(text) from public, anon, authenticated;
revoke execute on function private.network_blocked(uuid, uuid) from public, anon, authenticated;
revoke execute on function private.network_allow(uuid, text, integer) from public, anon, authenticated;
revoke execute on function private.network_face(uuid) from public, anon, authenticated;

create or replace function public.network_overview()
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
    'me', (
      select jsonb_build_object('on', p.network_on, 'discoverable', p.discoverable, 'username', p.username, 'at', p.network_at)
        from public.profiles p where p.id = me
    ),
    'connections', coalesce((
      select jsonb_agg(private.network_face(other) || jsonb_build_object('since', c.responded_at) order by c.responded_at desc)
        from (
          select c.*, case when c.requester = me then c.addressee else c.requester end as other
            from public.connections c
           where (c.requester = me or c.addressee = me) and c.status = 'accepted'
        ) c
       where private.network_member(other) and not private.network_blocked(me, other)
    ), '[]'::jsonb),
    'incoming', coalesce((
      select jsonb_agg(private.network_face(c.requester) || jsonb_build_object('since', c.created_at) order by c.created_at desc)
        from public.connections c
       where c.addressee = me and c.status = 'pending'
         and private.network_member(c.requester) and not private.network_blocked(me, c.requester)
    ), '[]'::jsonb),
    'outgoing', coalesce((
      select jsonb_agg(jsonb_build_object(
               'username', p.username,
               'name', case when p.discoverable then coalesce(nullif(p.network_card ->> 'name', ''), p.display_name, p.username) else p.username end,
               'since', c.created_at
             ) order by c.created_at desc)
        from public.connections c
        join public.profiles p on p.id = c.addressee
       where c.requester = me and c.status = 'pending' and p.network_on
    ), '[]'::jsonb),
    'blocked', coalesce((
      select jsonb_agg(jsonb_build_object('username', p.username, 'name', p.display_name) order by k.created_at desc)
        from public.blocks k
        join public.profiles p on p.id = k.blocked
       where k.blocker = me and p.username is not null
    ), '[]'::jsonb),
    'cheers', coalesce((
      select jsonb_agg(x.item order by x.created_at desc)
        from (
          select h.created_at,
                 jsonb_build_object(
                   'username', p.username,
                   'name', coalesce(nullif(p.network_card ->> 'name', ''), p.display_name, p.username),
                   'kind', h.kind,
                   'at', h.created_at,
                   'seen', h.seen
                 ) as item
            from public.cheers h
            join public.profiles p on p.id = h.sender
           where h.receiver = me
             and h.created_at > now() - interval '30 days'
             and not private.network_blocked(me, h.sender)
           order by h.created_at desc
           limit 30
        ) x
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.network_find(query text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  q text := lower(trim(coalesce(query, '')));
begin
  if not private.network_member(me) then
    raise exception 'not_member' using errcode = '42501';
  end if;
  if q !~ '^[a-z0-9-]{2,30}$' then
    return '[]'::jsonb;
  end if;
  if not private.network_allow(me, 'search', 300) then
    raise exception 'limit' using errcode = '54000';
  end if;
  return coalesce((
    select jsonb_agg(x.item order by x.username)
      from (
        select p.username,
               private.network_face(p.id) || jsonb_build_object('relation',
                 coalesce((
                   select case
                            when c.status = 'accepted' then 'connected'
                            when c.requester = me then 'sent'
                            else 'received'
                          end
                     from public.connections c
                    where least(c.requester, c.addressee) = least(me, p.id)
                      and greatest(c.requester, c.addressee) = greatest(me, p.id)
                 ), 'none')) as item
          from public.profiles p
         where p.network_on
           and p.discoverable
           and p.id <> me
           and p.username like q || '%'
           and not private.network_blocked(me, p.id)
         order by p.username
         limit 15
      ) x
  ), '[]'::jsonb);
end;
$$;

create or replace function public.network_suggest()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  my_role text;
begin
  if not private.network_member(me) then
    return '[]'::jsonb;
  end if;
  select p.target_role into my_role from public.profiles p where p.id = me;
  return coalesce((
    select jsonb_agg(x.item order by x.score desc, x.at desc nulls last)
      from (
        select private.network_face(p.id) as item,
               (case when my_role is not null and p.target_role = my_role then 1 else 0 end) as score,
               p.network_at as at
          from public.profiles p
         where p.network_on
           and p.discoverable
           and p.id <> me
           and not private.network_blocked(me, p.id)
           and not exists (
             select 1 from public.connections c
              where least(c.requester, c.addressee) = least(me, p.id)
                and greatest(c.requester, c.addressee) = greatest(me, p.id)
           )
         order by score desc, p.network_at desc nulls last
         limit 8
      ) x
  ), '[]'::jsonb);
end;
$$;

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
  if not private.network_allow(me, 'request', 20) then
    return jsonb_build_object('status', 'limit');
  end if;
  insert into public.connections (requester, addressee) values (me, target);
  return jsonb_build_object('status', 'sent');
end;
$$;

create or replace function public.network_respond(name text, accept boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  other uuid;
  changed integer;
begin
  select p.id into other from public.profiles p where p.username = lower(left(coalesce(name, ''), 40));
  if other is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  if accept and private.network_member(me) and not private.network_blocked(me, other) then
    update public.connections set status = 'accepted', responded_at = now()
     where requester = other and addressee = me and status = 'pending';
  else
    delete from public.connections where requester = other and addressee = me and status = 'pending';
  end if;
  get diagnostics changed = row_count;
  return jsonb_build_object('status', case when changed = 0 then 'not_found' when accept then 'connected' else 'declined' end);
end;
$$;

create or replace function public.network_remove(name text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  other uuid;
  changed integer;
begin
  select p.id into other from public.profiles p where p.username = lower(left(coalesce(name, ''), 40));
  if other is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  delete from public.connections c
   where least(c.requester, c.addressee) = least(me, other)
     and greatest(c.requester, c.addressee) = greatest(me, other);
  get diagnostics changed = row_count;
  return jsonb_build_object('status', case when changed = 0 then 'not_found' else 'removed' end);
end;
$$;

create or replace function public.network_block(name text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  other uuid;
begin
  select p.id into other from public.profiles p where p.username = lower(left(coalesce(name, ''), 40));
  if other is null or other = me then
    return jsonb_build_object('status', 'not_found');
  end if;
  insert into public.blocks (blocker, blocked) values (me, other) on conflict do nothing;
  delete from public.connections c
   where least(c.requester, c.addressee) = least(me, other)
     and greatest(c.requester, c.addressee) = greatest(me, other);
  return jsonb_build_object('status', 'blocked');
end;
$$;

create or replace function public.network_unblock(name text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  other uuid;
  changed integer;
begin
  select p.id into other from public.profiles p where p.username = lower(left(coalesce(name, ''), 40));
  delete from public.blocks where blocker = me and blocked = other;
  get diagnostics changed = row_count;
  return jsonb_build_object('status', case when changed = 0 then 'not_found' else 'unblocked' end);
end;
$$;

create or replace function public.network_report(name text, reason text, note text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  other uuid;
begin
  select p.id into other from public.profiles p where p.username = lower(left(coalesce(name, ''), 40));
  if other is null or other = me then
    return jsonb_build_object('status', 'not_found');
  end if;
  if reason is null or reason not in ('spam', 'harassment', 'fake', 'inappropriate', 'other') then
    return jsonb_build_object('status', 'bad_reason');
  end if;
  if not private.network_allow(me, 'report', 10) then
    return jsonb_build_object('status', 'limit');
  end if;
  insert into public.reports (reporter, reported, reason, note)
  values (me, other, reason, left(coalesce(note, ''), 500));
  return jsonb_build_object('status', 'reported');
end;
$$;

create or replace function public.network_cheer(name text, kind text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
  other uuid;
begin
  if kind is null or kind not in ('clap', 'fire', 'nudge') then
    return jsonb_build_object('status', 'bad_kind');
  end if;
  other := private.network_user(name);
  if other is null or private.network_blocked(me, other) or not exists (
    select 1 from public.connections c
     where least(c.requester, c.addressee) = least(me, other)
       and greatest(c.requester, c.addressee) = greatest(me, other)
       and c.status = 'accepted'
  ) then
    return jsonb_build_object('status', 'not_connected');
  end if;
  if exists (
    select 1 from public.cheers h
     where h.sender = me and h.receiver = other and h.kind = network_cheer.kind
       and h.created_at > now() - interval '1 day'
  ) then
    return jsonb_build_object('status', 'already');
  end if;
  if not private.network_allow(me, 'cheer', 100) then
    return jsonb_build_object('status', 'limit');
  end if;
  insert into public.cheers (sender, receiver, kind) values (me, other, network_cheer.kind);
  delete from public.cheers h where h.receiver = other and h.created_at < now() - interval '60 days';
  return jsonb_build_object('status', 'sent');
end;
$$;

create or replace function public.network_seen()
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := private.network_me();
begin
  update public.cheers set seen = true where receiver = me and not seen;
end;
$$;

revoke execute on function public.network_overview() from public, anon;
revoke execute on function public.network_find(text) from public, anon;
revoke execute on function public.network_suggest() from public, anon;
revoke execute on function public.network_request(text) from public, anon;
revoke execute on function public.network_respond(text, boolean) from public, anon;
revoke execute on function public.network_remove(text) from public, anon;
revoke execute on function public.network_block(text) from public, anon;
revoke execute on function public.network_unblock(text) from public, anon;
revoke execute on function public.network_report(text, text, text) from public, anon;
revoke execute on function public.network_cheer(text, text) from public, anon;
revoke execute on function public.network_seen() from public, anon;

grant execute on function public.network_overview() to authenticated;
grant execute on function public.network_find(text) to authenticated;
grant execute on function public.network_suggest() to authenticated;
grant execute on function public.network_request(text) to authenticated;
grant execute on function public.network_respond(text, boolean) to authenticated;
grant execute on function public.network_remove(text) to authenticated;
grant execute on function public.network_block(text) to authenticated;
grant execute on function public.network_unblock(text) to authenticated;
grant execute on function public.network_report(text, text, text) to authenticated;
grant execute on function public.network_cheer(text, text) to authenticated;
grant execute on function public.network_seen() to authenticated;
