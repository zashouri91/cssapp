-- First, let's disable RLS temporarily to ensure we can query the tables
alter table public.user_roles disable row level security;
alter table public.groups disable row level security;
alter table public.locations disable row level security;

-- Create a function to check if a user is an admin in an organization
create or replace function public.is_admin(p_user_id text, p_org_id text)
returns boolean as $$
begin
  return exists (
    select 1
    from user_roles
    where user_id = p_user_id
    and organization_id = p_org_id
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Re-enable RLS
alter table public.user_roles enable row level security;
alter table public.groups enable row level security;
alter table public.locations enable row level security;

-- Drop existing policies
drop policy if exists "Users can view roles in their organization" on public.user_roles;
drop policy if exists "Only admins can manage roles" on public.user_roles;
drop policy if exists "Users can view their own roles" on public.user_roles;
drop policy if exists "Admins can view all roles in their organizations" on public.user_roles;
drop policy if exists "Admins can manage roles" on public.user_roles;
drop policy if exists "Admins can update roles" on public.user_roles;
drop policy if exists "Admins can delete roles" on public.user_roles;

-- Create simplified policies for user_roles
create policy "user_roles_select_policy"
  on public.user_roles for select
  using (
    -- Users can see their own roles
    user_id = auth.uid()::text
    -- Admins can see all roles in their org
    or exists (
      select 1 
      from user_roles ur 
      where ur.user_id = auth.uid()::text 
      and ur.organization_id = user_roles.organization_id 
      and ur.role = 'admin'
      and ur.user_id <> user_roles.user_id  -- Avoid self-reference
    )
  );

create policy "user_roles_insert_policy"
  on public.user_roles for insert
  with check (
    public.is_admin(auth.uid()::text, organization_id)
  );

create policy "user_roles_update_policy"
  on public.user_roles for update
  using (
    public.is_admin(auth.uid()::text, organization_id)
  );

create policy "user_roles_delete_policy"
  on public.user_roles for delete
  using (
    public.is_admin(auth.uid()::text, organization_id)
  );

-- Update groups policies
drop policy if exists "Users can view groups in their organizations" on public.groups;
drop policy if exists "Admins can manage groups" on public.groups;

create policy "groups_select_policy"
  on public.groups for select
  using (
    exists (
      select 1
      from user_roles ur
      where ur.user_id = auth.uid()::text
      and ur.organization_id = groups.organization_id
    )
  );

create policy "groups_insert_policy"
  on public.groups for insert
  with check (
    public.is_admin(auth.uid()::text, organization_id)
  );

create policy "groups_update_policy"
  on public.groups for update
  using (
    public.is_admin(auth.uid()::text, organization_id)
  );

create policy "groups_delete_policy"
  on public.groups for delete
  using (
    public.is_admin(auth.uid()::text, organization_id)
  );

-- Update locations policies
drop policy if exists "Users can view locations in their organizations" on public.locations;
drop policy if exists "Admins can manage locations" on public.locations;

create policy "locations_select_policy"
  on public.locations for select
  using (
    exists (
      select 1
      from user_roles ur
      where ur.user_id = auth.uid()::text
      and ur.organization_id = locations.organization_id
    )
  );

create policy "locations_insert_policy"
  on public.locations for insert
  with check (
    public.is_admin(auth.uid()::text, organization_id)
  );

create policy "locations_update_policy"
  on public.locations for update
  using (
    public.is_admin(auth.uid()::text, organization_id)
  );

create policy "locations_delete_policy"
  on public.locations for delete
  using (
    public.is_admin(auth.uid()::text, organization_id)
  );
