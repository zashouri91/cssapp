-- First, disable RLS
alter table public.user_roles disable row level security;
alter table public.groups disable row level security;
alter table public.locations disable row level security;

-- Drop existing policies and objects
drop policy if exists "user_roles_select_policy" on public.user_roles;
drop policy if exists "user_roles_insert_policy" on public.user_roles;
drop policy if exists "user_roles_update_policy" on public.user_roles;
drop policy if exists "user_roles_delete_policy" on public.user_roles;
drop policy if exists "groups_select_policy" on public.groups;
drop policy if exists "groups_insert_policy" on public.groups;
drop policy if exists "groups_update_policy" on public.groups;
drop policy if exists "groups_delete_policy" on public.groups;
drop policy if exists "locations_select_policy" on public.locations;
drop policy if exists "locations_insert_policy" on public.locations;
drop policy if exists "locations_update_policy" on public.locations;
drop policy if exists "locations_delete_policy" on public.locations;
drop function if exists is_admin(org_id text);
drop function if exists get_user_roles(uid text, org_id text);
drop function if exists check_group_access(check_org_id text);

-- Create location_members table if it doesn't exist
create table if not exists public.location_members (
  id uuid default uuid_generate_v4() primary key,
  location_id text references public.locations(id) on delete cascade,
  user_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(location_id, user_id)
);

-- Add created_by column to groups table
alter table public.groups 
add column if not exists created_by text not null;

-- Add created_by column to locations table
alter table public.locations 
add column if not exists created_by text not null;

-- Bootstrap: Create admin role for initial user
insert into user_roles (user_id, organization_id, role)
values 
  ('user_2rS2g3UfjJDLcG9rhpaiTZTJJBt', 'org_2rS2Kzxqtxu0CTdooFpAZGB7Gr8', 'admin')
on conflict (user_id, organization_id, role) do nothing;

-- Create function to check group access with debugging
create or replace function check_group_access(check_org_id text, check_user_id text)
returns boolean as $$
declare
  has_access boolean;
begin  
  -- Check access
  select exists (
    select 1
    from user_roles
    where user_id = check_user_id
    and organization_id = check_org_id
    and role = 'admin'
  ) into has_access;
  
  -- Log for debugging
  raise notice 'Group access check - User: %, Org: %, Has Access: %', 
    check_user_id, check_org_id, has_access;
    
  return has_access;
end;
$$ language plpgsql security definer;

-- Create new policies for user_roles
create policy "user_roles_select_policy"
  on public.user_roles for select
  using (true);  -- Allow all reads for debugging

create policy "user_roles_insert_policy"
  on public.user_roles for insert
  with check (check_group_access(organization_id, user_id));

create policy "user_roles_update_policy"
  on public.user_roles for update
  using (check_group_access(organization_id, user_id));

create policy "user_roles_delete_policy"
  on public.user_roles for delete
  using (check_group_access(organization_id, user_id));

-- Create policies for groups table
create policy "groups_select_policy"
  on public.groups for select
  using (true);  -- Allow all reads for debugging

create policy "groups_insert_policy"
  on public.groups for insert
  with check (check_group_access(organization_id, created_by));

create policy "groups_update_policy"
  on public.groups for update
  using (check_group_access(organization_id, created_by));

create policy "groups_delete_policy"
  on public.groups for delete
  using (check_group_access(organization_id, created_by));

-- Create policies for locations table
create policy "locations_select_policy"
  on public.locations for select
  using (true);  -- Allow all reads for debugging

create policy "locations_insert_policy"
  on public.locations for insert
  with check (check_group_access(organization_id, created_by));

create policy "locations_update_policy"
  on public.locations for update
  using (check_group_access(organization_id, created_by));

create policy "locations_delete_policy"
  on public.locations for delete
  using (check_group_access(organization_id, created_by));

-- Create policies for location_members table
create policy "location_members_select_policy"
  on public.location_members for select
  using (true);  -- Allow all reads for debugging

create policy "location_members_insert_policy"
  on public.location_members for insert
  with check (
    exists (
      select 1 from locations l
      where l.id = location_id
      and check_group_access(l.organization_id, user_id)
    )
  );

create policy "location_members_delete_policy"
  on public.location_members for delete
  using (
    exists (
      select 1 from locations l
      where l.id = location_id
      and check_group_access(l.organization_id, user_id)
    )
  );

-- Re-enable RLS
alter table public.user_roles enable row level security;
alter table public.groups enable row level security;
alter table public.locations enable row level security;
alter table public.location_members enable row level security;

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant all on all routines in schema public to authenticated;

-- Grant anonymous access for now
grant usage on schema public to anon;
grant all on all tables in schema public to anon;
grant all on all sequences in schema public to anon;
grant all on all routines in schema public to anon;
