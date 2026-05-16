-- ============================================================
-- Migration: Create buyers table + password reset support
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create buyers table
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Buyers can read own profile" ON buyers;
DROP POLICY IF EXISTS "Buyers can update own profile" ON buyers;
DROP POLICY IF EXISTS "Buyers can insert own profile" ON buyers;

-- Buyers can read their own profile
CREATE POLICY "Buyers can read own profile"
  ON buyers FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Buyers can update their own profile
CREATE POLICY "Buyers can update own profile"
  ON buyers FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Buyers can insert their own profile (registration)
CREATE POLICY "Buyers can insert own profile"
  ON buyers FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- 4. Backfill existing auth users into buyers table (if any)
--    This picks up anyone who signed up but doesn't have a buyers record
INSERT INTO buyers (id, email, created_at)
SELECT id, email, created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM buyers)
  AND id NOT IN (SELECT auth_user_id FROM vendors WHERE auth_user_id IS NOT NULL)
ON CONFLICT (id) DO NOTHING;
