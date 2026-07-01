create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  institution text,
  status text check (status in ('mahasiswa', 'profesional', 'umum')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  category text,
  team_min integer default 1,
  team_max integer default 5,
  registration_open timestamptz,
  registration_close timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  competition_id uuid references public.competitions(id),
  team_name text not null,
  team_members jsonb not null,
  document_urls jsonb,
  status text default 'pending' check (status in ('pending', 'verified', 'rejected')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.rsvp (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique,
  confirmed_at timestamptz default now(),
  qr_code text unique default gen_random_uuid()::text,
  checked_in boolean default false,
  checked_in_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.competitions enable row level security;
alter table public.registrations enable row level security;
alter table public.rsvp enable row level security;

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Competitions are public" on public.competitions;
create policy "Competitions are public" on public.competitions
  for select using (true);

drop policy if exists "Users manage own registrations" on public.registrations;
create policy "Users manage own registrations" on public.registrations
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own rsvp" on public.rsvp;
create policy "Users manage own rsvp" on public.rsvp
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
