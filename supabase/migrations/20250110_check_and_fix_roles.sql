-- First, let's check if the user has any roles
select * from user_roles;

-- Let's make sure our admin check function works
select public.is_admin(auth.uid()::text, 'org_2rS2Kzxqtxu0CTdooFpAZGB7Gr8');

-- Let's grant admin role to your user if not already present
insert into user_roles (user_id, organization_id, role)
select 
  auth.uid()::text,
  'org_2rS2Kzxqtxu0CTdooFpAZGB7Gr8',
  'admin'
where not exists (
  select 1 
  from user_roles 
  where user_id = auth.uid()::text 
  and organization_id = 'org_2rS2Kzxqtxu0CTdooFpAZGB7Gr8'
  and role = 'admin'
);

-- Update the groups policies to be more permissive for testing
drop policy if exists "groups_insert_policy" on public.groups;
drop policy if exists "groups_select_policy" on public.groups;

create policy "groups_select_policy"
  on public.groups for select
  using (true);

create policy "groups_insert_policy"
  on public.groups for insert
  with check (
    exists (
      select 1
      from user_roles ur
      where ur.user_id = auth.uid()::text
      and ur.organization_id = groups.organization_id
      and ur.role = 'admin'
    )
  );
