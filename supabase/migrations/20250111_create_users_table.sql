-- Create enum for user roles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');
    END IF;
END $$;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  clerk_id TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'user',
  organization_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_clerk_id_idx') THEN
        CREATE INDEX users_clerk_id_idx ON users(clerk_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_organization_id_idx') THEN
        CREATE INDEX users_organization_id_idx ON users(organization_id);
    END IF;
END $$;

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and create it again
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own organization's users" ON users;
DROP POLICY IF EXISTS "Users can update their own organization's users" ON users;
DROP POLICY IF EXISTS "Users can insert into their own organization" ON users;
DROP POLICY IF EXISTS "Users can delete from their own organization" ON users;

-- Create RLS policies
CREATE POLICY "Users can view their own organization's users"
ON users FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE clerk_id = auth.jwt()->>'sub'
  )
);

CREATE POLICY "Users can update their own organization's users"
ON users FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE clerk_id = auth.jwt()->>'sub'
  )
  AND EXISTS (
    SELECT 1 
    FROM users 
    WHERE clerk_id = auth.jwt()->>'sub'
    AND role IN ('admin', 'manager')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE clerk_id = auth.jwt()->>'sub'
  )
);

CREATE POLICY "Users can insert into their own organization"
ON users FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE clerk_id = auth.jwt()->>'sub'
  )
  AND EXISTS (
    SELECT 1 
    FROM users 
    WHERE clerk_id = auth.jwt()->>'sub'
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Users can delete from their own organization"
ON users FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE clerk_id = auth.jwt()->>'sub'
  )
  AND EXISTS (
    SELECT 1 
    FROM users 
    WHERE clerk_id = auth.jwt()->>'sub'
    AND role IN ('admin', 'manager')
  )
);
