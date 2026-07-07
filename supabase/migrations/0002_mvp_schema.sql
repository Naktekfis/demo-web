create extension if not exists pgcrypto;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.set_updated_at();
drop function if exists public.is_admin(uuid);
drop function if exists public.is_team_member(uuid, uuid);

drop table if exists public.admin_roles cascade;
drop table if exists public.competition_registrations cascade;
drop table if exists public.competition_team_members cascade;
drop table if exists public.competition_teams cascade;
drop table if exists public.visitor_tickets cascade;
drop table if exists public.registrations cascade;
drop table if exists public.rsvp cascade;
drop table if exists public.competitions cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  institution text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.visitor_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  qr_code text not null unique default encode(gen_random_bytes(32), 'hex'),
  ticket_type text not null default 'general_gate',
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  checked_in_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visitor_tickets_checked_in_consistency check (
    (checked_in = false and checked_in_at is null and checked_in_by is null)
    or (checked_in = true and checked_in_at is not null)
  )
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  category text,
  registration_type text not null check (registration_type in ('individual', 'team')),
  team_uid_prefix text,
  team_min integer not null default 1 check (team_min >= 1),
  team_max integer not null default 1 check (team_max >= 1),
  registration_open timestamptz,
  registration_close timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint competitions_team_size_order check (team_min <= team_max),
  constraint competitions_individual_team_size check (
    registration_type <> 'individual' or (team_min = 1 and team_max = 1 and team_uid_prefix is null)
  ),
  constraint competitions_team_prefix_required check (
    registration_type <> 'team' or team_uid_prefix is not null
  )
);

create table public.competition_teams (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  team_uid text not null unique,
  team_name text not null,
  leader_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, team_name)
);

create table public.competition_team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.competition_teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  institution text not null,
  member_role text not null check (member_role in ('leader', 'member')),
  joined_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create unique index competition_team_members_one_leader_per_team
  on public.competition_team_members (team_id)
  where member_role = 'leader';

create table public.competition_registrations (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id),
  registration_kind text not null check (registration_kind in ('individual', 'team')),
  user_id uuid references public.profiles(id),
  team_id uuid references public.competition_teams(id),
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  note text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint competition_registrations_kind_target check (
    (registration_kind = 'individual' and user_id is not null and team_id is null)
    or (registration_kind = 'team' and team_id is not null)
  )
);

create unique index competition_registrations_one_individual
  on public.competition_registrations (competition_id, user_id)
  where registration_kind = 'individual';

create unique index competition_registrations_one_team
  on public.competition_registrations (competition_id, team_id)
  where registration_kind = 'team';

create table public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

create index competition_teams_competition_id_idx on public.competition_teams (competition_id);
create index competition_teams_leader_user_id_idx on public.competition_teams (leader_user_id);
create index competition_team_members_team_id_idx on public.competition_team_members (team_id);
create index competition_team_members_user_id_idx on public.competition_team_members (user_id);
create index competition_registrations_competition_id_idx on public.competition_registrations (competition_id);
create index competition_registrations_user_id_idx on public.competition_registrations (user_id);
create index competition_registrations_team_id_idx on public.competition_registrations (team_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger visitor_tickets_set_updated_at
  before update on public.visitor_tickets
  for each row execute function public.set_updated_at();

create trigger competition_teams_set_updated_at
  before update on public.competition_teams
  for each row execute function public.set_updated_at();

create trigger competition_registrations_set_updated_at
  before update on public.competition_registrations
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), new.email, 'Visitor'),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.visitor_tickets enable row level security;
alter table public.competitions enable row level security;
alter table public.competition_teams enable row level security;
alter table public.competition_team_members enable row level security;
alter table public.competition_registrations enable row level security;
alter table public.admin_roles enable row level security;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_roles
    where admin_roles.user_id = is_admin.user_id
      and admin_roles.role = 'admin'
  );
$$;

create or replace function public.is_team_member(team_id uuid, user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.competition_team_members
    where competition_team_members.team_id = is_team_member.team_id
      and competition_team_members.user_id = is_team_member.user_id
  );
$$;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read own visitor ticket" on public.visitor_tickets
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Active competitions are public" on public.competitions
  for select using (is_active = true or public.is_admin(auth.uid()));

create policy "Team members can read joined teams" on public.competition_teams
  for select using (
    leader_user_id = auth.uid()
    or public.is_admin(auth.uid())
    or public.is_team_member(competition_teams.id, auth.uid())
  );

create policy "Team members can read team memberships" on public.competition_team_members
  for select using (
    user_id = auth.uid()
    or public.is_admin(auth.uid())
    or public.is_team_member(competition_team_members.team_id, auth.uid())
  );

create policy "Participants can read own registrations" on public.competition_registrations
  for select using (
    user_id = auth.uid()
    or public.is_admin(auth.uid())
    or public.is_team_member(competition_registrations.team_id, auth.uid())
  );

create policy "Admins can read admin roles" on public.admin_roles
  for select using (user_id = auth.uid() or public.is_admin(auth.uid()));

insert into public.competitions (
  slug,
  name,
  description,
  category,
  registration_type,
  team_uid_prefix,
  team_min,
  team_max,
  registration_open,
  registration_close,
  is_active
) values
  (
    'robotika-challenge',
    'Robotika Challenge',
    'Kompetisi robotika untuk tim mahasiswa yang ingin membangun prototipe cerdas dan kompetitif.',
    'robotika',
    'team',
    'RBT',
    2,
    4,
    now(),
    now() + interval '14 days',
    true
  ),
  (
    'hackathon-innovation-sprint',
    'Hackathon Innovation Sprint',
    'Sprint pengembangan produk digital dengan fokus pada solusi nyata untuk kampus dan industri.',
    'hackathon',
    'team',
    'HCK',
    3,
    5,
    now(),
    now() + interval '10 days',
    true
  ),
  (
    'paper-competition',
    'Paper Competition',
    'Kompetisi penulisan karya ilmiah individual untuk ide teknologi dan inovasi digital.',
    'paper',
    'individual',
    null,
    1,
    1,
    now(),
    now() + interval '21 days',
    true
  );
