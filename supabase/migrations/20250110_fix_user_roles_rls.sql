-- Drop existing policies for user_roles
drop policy if exists "Users can view roles in their organization" on public.user_roles;
drop policy if exists "Only admins can manage roles" on public.user_roles;

-- Create new policies for user_roles
create policy "Users can view their own roles"
  on public.user_roles for select
  using (user_id = auth.uid()::text);

create policy "Admins can view all roles in their organizations"
  on public.user_roles for select
  using (
    exists (
      select 1
      from user_roles ur
      where ur.user_id = auth.uid()::text
      and ur.organization_id = user_roles.organization_id
      and ur.role = 'admin'
    )
  );

create policy "Admins can manage roles"
  on public.user_roles for insert
  with check (
    exists (
      select 1
      from user_roles ur
      where ur.user_id = auth.uid()::text
      and ur.organization_id = user_roles.organization_id
      and ur.role = 'admin'
    )
  );

create policy "Admins can update roles"
  on public.user_roles for update
  using (
    exists (
      select 1
      from user_roles ur
      where ur.user_id = auth.uid()::text
      and ur.organization_id = user_roles.organization_id
      and ur.role = 'admin'
    )
  );

create policy "Admins can delete roles"
  on public.user_roles for delete
  using (
    exists (
      select 1
      from user_roles ur
      where ur.user_id = auth.uid()::text
      and ur.organization_id = user_roles.organization_id
      and ur.role = 'admin'
    )
  );

-- Update groups policies to avoid recursion
drop policy if exists "Users can view groups in their organization" on public.groups;
drop policy if exists "Only admins can create groups" on public.groups;
drop policy if exists "Only admins can update groups" on public.groups;

create policy "Users can view groups in their organizations"
  on public.groups for select
  using (
    exists (
      select 1
      from user_roles ur
      where ur.user_id = auth.uid()::text
      and ur.organization_id = groups.organization_id
    )
  );

create policy "Admins can manage groups"
  on public.groups for all
  using (
    exists (
      select 1
      from user_roles ur
      where ur.user_id = auth.uid()::text
      and ur.organization_id = groups.organization_id
      and ur.role = 'admin'
    )
  );

-- Update locations policies to avoid recursion
drop policy if exists "Users can view locations in their organization" on public.locations;
drop policy if exists "Only admins can create locations" on public.locations;
drop policy if exists "Only admins can update locations" on public.locations;

create policy "Users can view locations in their organizations"
  on public.locations for select
  using (
    exists (
      select 1
      from user_roles ur
      where ur.user_id = auth.uid()::text
      and ur.organization_id = locations.organization_id
    )
  );

create policy "Admins can manage locations"
  on public.locations for all
  using (
    exists (
      select 1
      from user_roles ur
      where ur.user_id = auth.uid()::text
      and ur.organization_id = locations.organization_id
      and ur.role = 'admin'
    )
  );
