-- Drop existing policies
drop policy if exists "Users can view profiles in their organization" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

-- Create new policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (id = auth.uid()::text);

create policy "Users can view profiles in organizations they belong to"
  on public.profiles for select
  using (
    exists (
      select 1
      from user_roles ur
      where ur.user_id = auth.uid()::text
      and ur.organization_id = profiles.organization_id
    )
  );

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid()::text);

-- Update organizations policy
drop policy if exists "Users can view their organizations" on public.organizations;

create policy "Users can view their organizations"
  on public.organizations for select
  using (
    exists (
      select 1
      from user_roles ur
      where ur.user_id = auth.uid()::text
      and ur.organization_id = organizations.id
    )
  );
