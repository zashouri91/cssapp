-- Disable RLS temporarily to ensure we can insert
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Insert admin role for the user if it doesn't exist
INSERT INTO user_roles (user_id, organization_id, role)
SELECT 
  'user_2rS2g3UfjJDLcG9rhpaiTZTJJBt',
  'org_2rS2Kzxqtxu0CTdooFpAZGB7Gr8',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 
  FROM user_roles 
  WHERE user_id = 'user_2rS2g3UfjJDLcG9rhpaiTZTJJBt'
  AND organization_id = 'org_2rS2Kzxqtxu0CTdooFpAZGB7Gr8'
  AND role = 'admin'
);

-- Re-enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Verify the role was added
SELECT * FROM user_roles 
WHERE user_id = 'user_2rS2g3UfjJDLcG9rhpaiTZTJJBt'
AND organization_id = 'org_2rS2Kzxqtxu0CTdooFpAZGB7Gr8';
