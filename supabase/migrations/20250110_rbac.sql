-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Drop existing types if they exist
do $$ 
begin
    if exists (select 1 from pg_type where typname = 'user_role') then
        drop type user_role cascade;
    end if;
    if exists (select 1 from pg_type where typname = 'audit_action') then
        drop type audit_action cascade;
    end if;
end $$;

-- Create custom types
create type user_role as enum ('admin', 'manager', 'employee', 'user');
create type audit_action as enum (
  'add_role',
  'remove_role',
  'add_permission',
  'remove_permission',
  'login',
  'logout',
  'access_denied'
);

-- Drop existing tables if they exist
drop table if exists public.audit_logs cascade;
drop table if exists public.user_permissions cascade;
drop table if exists public.user_roles cascade;
drop table if exists public.group_members cascade;
drop table if exists public.groups cascade;
drop table if exists public.locations cascade;
drop table if exists public.profiles cascade;
drop table if exists public.organizations cascade;

-- Create organizations table first (since it's referenced by other tables)
create table public.organizations (
  id text primary key,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles table linked to Clerk users
create table public.profiles (
  id text primary key,
  email text not null,
  full_name text,
  organization_id text references organizations(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_roles table
create table public.user_roles (
  id text primary key default uuid_generate_v4()::text,
  user_id text not null references profiles(id) on delete cascade,
  organization_id text not null references organizations(id) on delete cascade,
  role text not null check (role in ('admin', 'manager', 'employee', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, organization_id, role)
);

-- Create user_permissions table
create table public.user_permissions (
  id text primary key default uuid_generate_v4()::text,
  user_id text not null references profiles(id) on delete cascade,
  organization_id text not null references organizations(id) on delete cascade,
  permission text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, organization_id, permission)
);

-- Create audit_logs table
create table public.audit_logs (
  id text primary key default uuid_generate_v4()::text,
  user_id text references profiles(id) on delete set null,
  organization_id text references organizations(id) on delete set null,
  action text not null check (
    action in (
      'add_role',
      'remove_role',
      'add_permission',
      'remove_permission',
      'login',
      'logout',
      'access_denied'
    )
  ),
  details jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create groups table
create table public.groups (
  id text primary key default uuid_generate_v4()::text,
  name text not null,
  description text,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create locations table
create table public.locations (
  id text primary key default uuid_generate_v4()::text,
  name text not null,
  address text not null,
  city text not null,
  state text not null,
  country text not null,
  postal_code text not null,
  organization_id text not null references organizations(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create group members table
create table public.group_members (
  id text primary key default uuid_generate_v4()::text,
  group_id text not null references groups(id) on delete cascade,
  user_id text not null references profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, user_id)
);

-- Create RLS policies

-- Organizations policies
alter table public.organizations enable row level security;

create policy "Users can view their organizations"
  on public.organizations for select
  using (
    id in (
      select organization_id
      from profiles
      where id = auth.uid()::text
    )
  );

-- Profiles policies
alter table public.profiles enable row level security;

create policy "Users can view profiles in their organization"
  on public.profiles for select
  using (
    organization_id in (
      select organization_id
      from profiles
      where id = auth.uid()::text
    )
  );

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid()::text);

-- User roles policies
alter table public.user_roles enable row level security;

create policy "Users can view roles in their organization"
  on public.user_roles for select
  using (
    organization_id in (
      select organization_id
      from profiles
      where id = auth.uid()::text
    )
  );

create policy "Only admins can manage roles"
  on public.user_roles for all
  using (
    exists (
      select 1
      from user_roles
      where user_id = auth.uid()::text
        and organization_id = user_roles.organization_id
        and role = 'admin'
    )
  );

-- User permissions policies
alter table public.user_permissions enable row level security;

create policy "Users can view permissions in their organization"
  on public.user_permissions for select
  using (
    organization_id in (
      select organization_id
      from profiles
      where id = auth.uid()::text
    )
  );

create policy "Only admins can manage permissions"
  on public.user_permissions for all
  using (
    exists (
      select 1
      from user_roles
      where user_id = auth.uid()::text
        and organization_id = user_permissions.organization_id
        and role = 'admin'
    )
  );

-- Audit logs policies
alter table public.audit_logs enable row level security;

create policy "Users can view audit logs in their organization"
  on public.audit_logs for select
  using (
    organization_id in (
      select organization_id
      from profiles
      where id = auth.uid()::text
    )
  );

create policy "System can create audit logs"
  on public.audit_logs for insert
  with check (true);

-- Groups policies
alter table public.groups enable row level security;

create policy "Users can view groups in their organization"
  on public.groups for select
  using (
    organization_id in (
      select organization_id
      from profiles
      where id = auth.uid()::text
    )
  );

create policy "Only admins can create groups"
  on public.groups for insert
  with check (
    exists (
      select 1
      from user_roles
      where user_id = auth.uid()::text
        and organization_id = groups.organization_id
        and role = 'admin'
    )
  );

create policy "Only admins can update groups"
  on public.groups for update
  using (
    exists (
      select 1
      from user_roles
      where user_id = auth.uid()::text
        and organization_id = groups.organization_id
        and role = 'admin'
    )
  );

-- Locations policies
alter table public.locations enable row level security;

create policy "Users can view locations in their organization"
  on public.locations for select
  using (
    organization_id in (
      select organization_id
      from profiles
      where id = auth.uid()::text
    )
  );

create policy "Only admins can create locations"
  on public.locations for insert
  with check (
    exists (
      select 1
      from user_roles
      where user_id = auth.uid()::text
        and organization_id = locations.organization_id
        and role = 'admin'
    )
  );

create policy "Only admins can update locations"
  on public.locations for update
  using (
    exists (
      select 1
      from user_roles
      where user_id = auth.uid()::text
        and organization_id = locations.organization_id
        and role = 'admin'
    )
  );

-- Group members policies
alter table public.group_members enable row level security;

create policy "Users can view group members in their organization"
  on public.group_members for select
  using (
    exists (
      select 1
      from groups g
      where g.id = group_members.group_id
        and g.organization_id in (
          select organization_id
          from profiles
          where id = auth.uid()::text
        )
    )
  );

create policy "Only admins can manage group members"
  on public.group_members for all
  using (
    exists (
      select 1
      from groups g
      join user_roles ur on ur.organization_id = g.organization_id
      where g.id = group_members.group_id
        and ur.user_id = auth.uid()::text
        and ur.role = 'admin'
    )
  );

-- Functions
create or replace function public.get_user_permissions(p_user_id text, p_organization_id text)
returns table (permission text)
language sql
security definer
as $$
  select distinct permission
  from user_permissions
  where user_id = p_user_id
    and organization_id = p_organization_id;
$$;
