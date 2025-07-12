
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS table with RLS
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text default 'team_admin' check (role in ('team_admin', 'organizer', 'referee')),
  profile_data jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TOURNAMENTS table with RLS
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references public.users(id) on delete cascade,
  name text not null,
  description text,
  start_date date,
  end_date date,
  enrollment_deadline date,
  status text default 'enrolling' check (status in ('enrolling', 'live', 'finished')),
  max_teams integer default 16,
  tournament_data jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TEAMS table with RLS
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  admin_user_id uuid references public.users(id) on delete cascade,
  name text not null,
  logo_url text,
  colors jsonb default '{}',
  team_data jsonb default '{}',
  enrollment_status text default 'pending' check (enrollment_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TEAM_MEMBERS table (players and staff)
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  name text not null,
  position text,
  jersey_number integer,
  member_type text default 'player' check (member_type in ('player', 'coach', 'staff')),
  member_data jsonb default '{}',
  created_at timestamptz default now(),
  unique(team_id, jersey_number, member_type) -- prevent duplicate jersey numbers per team
);

-- FIXTURES table
create table if not exists public.fixtures (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  match_day integer,
  home_team_id uuid references public.teams(id),
  away_team_id uuid references public.teams(id),
  home_score integer default 0,
  away_score integer default 0,
  kickoff timestamptz,
  venue text,
  status text default 'scheduled' check (status in ('scheduled', 'live', 'finished', 'cancelled')),
  match_data jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOTIFICATIONS table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  tournament_id uuid references public.tournaments(id) on delete cascade,
  message text not null,
  notification_type text default 'info' check (notification_type in ('info', 'approval', 'rejection', 'reminder')),
  read boolean default false,
  notification_data jsonb default '{}',
  created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.tournaments enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.fixtures enable row level security;
alter table public.notifications enable row level security;

-- RLS Policies for USERS
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = auth_user_id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = auth_user_id);

create policy "Allow user creation during signup"
  on public.users for insert
  with check (auth.uid() = auth_user_id);

-- RLS Policies for TOURNAMENTS
create policy "Anyone can view public tournaments"
  on public.tournaments for select
  using (true);

create policy "Organizers can create tournaments"
  on public.tournaments for insert
  with check (
    exists(select 1 from public.users where id = organizer_id and auth_user_id = auth.uid() and role = 'organizer')
  );

create policy "Organizers can update their tournaments"
  on public.tournaments for update
  using (
    exists(select 1 from public.users where id = organizer_id and auth_user_id = auth.uid())
  );

-- RLS Policies for TEAMS
create policy "Anyone can view approved teams"
  on public.teams for select
  using (enrollment_status = 'approved' or exists(select 1 from public.users where id = admin_user_id and auth_user_id = auth.uid()));

create policy "Team admins can create teams"
  on public.teams for insert
  with check (
    exists(select 1 from public.users where id = admin_user_id and auth_user_id = auth.uid())
  );

create policy "Team admins can update their teams"
  on public.teams for update
  using (
    exists(select 1 from public.users where id = admin_user_id and auth_user_id = auth.uid())
  );

-- RLS Policies for TEAM_MEMBERS
create policy "Anyone can view team members of approved teams"
  on public.team_members for select
  using (
    exists(select 1 from public.teams where id = team_id and enrollment_status = 'approved')
    or exists(select 1 from public.teams t join public.users u on t.admin_user_id = u.id where t.id = team_id and u.auth_user_id = auth.uid())
  );

create policy "Team admins can manage their team members"
  on public.team_members for all
  using (
    exists(select 1 from public.teams t join public.users u on t.admin_user_id = u.id where t.id = team_id and u.auth_user_id = auth.uid())
  );

-- RLS Policies for FIXTURES
create policy "Anyone can view fixtures"
  on public.fixtures for select
  using (true);

create policy "Tournament organizers can manage fixtures"
  on public.fixtures for all
  using (
    exists(select 1 from public.tournaments t join public.users u on t.organizer_id = u.id where t.id = tournament_id and u.auth_user_id = auth.uid())
  );

-- RLS Policies for NOTIFICATIONS
create policy "Users can view their notifications"
  on public.notifications for select
  using (
    exists(select 1 from public.users where id = user_id and auth_user_id = auth.uid())
  );

create policy "Users can update their notifications"
  on public.notifications for update
  using (
    exists(select 1 from public.users where id = user_id and auth_user_id = auth.uid())
  );

create policy "System can create notifications"
  on public.notifications for insert
  with check (true);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (auth_user_id, email, full_name)
  values (
    new.id, 
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  return new;
end;
$$;

-- Trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add update triggers to all tables with updated_at
create trigger update_users_updated_at before update on public.users
  for each row execute procedure public.update_updated_at_column();

create trigger update_tournaments_updated_at before update on public.tournaments
  for each row execute procedure public.update_updated_at_column();

create trigger update_teams_updated_at before update on public.teams
  for each row execute procedure public.update_updated_at_column();

create trigger update_fixtures_updated_at before update on public.fixtures
  for each row execute procedure public.update_updated_at_column();
