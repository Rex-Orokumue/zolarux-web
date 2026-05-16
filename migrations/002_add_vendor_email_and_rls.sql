-- ============================================================
-- Migration: Add email to vendors + Proper RLS for products
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Add email column to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Backfill emails from vendor_applications
UPDATE vendors v
SET email = va.email
FROM vendor_applications va
WHERE v.vendor_id = va.reference
  AND va.email IS NOT NULL
  AND v.email IS NULL;

-- 3. Create a helper function to get the vendor_id for the current auth user
--    (placed in public schema since auth schema is restricted)
CREATE OR REPLACE FUNCTION public.get_vendor_id()
RETURNS TEXT AS $$
  SELECT vendor_id FROM public.vendors WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. Enable RLS on products table (if not already)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies on products (if any) to start clean
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Vendors can insert own products" ON products;
DROP POLICY IF EXISTS "Vendors can update own products" ON products;
DROP POLICY IF EXISTS "Vendors can delete own products" ON products;

-- 6. SELECT — anyone can view products (public browsing)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- 7. INSERT — authenticated vendors can insert products with their own vendor_id
CREATE POLICY "Vendors can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id = public.get_vendor_id());

-- 8. UPDATE — vendors can only update their own products
CREATE POLICY "Vendors can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (vendor_id = public.get_vendor_id())
  WITH CHECK (vendor_id = public.get_vendor_id());

-- 9. DELETE — vendors can only delete their own products
CREATE POLICY "Vendors can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (vendor_id = public.get_vendor_id());

-- ============================================================
-- Also ensure the vendors table RLS allows vendors to read their own record
-- ============================================================
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read vendor profiles" ON vendors;
DROP POLICY IF EXISTS "Vendors can update own record" ON vendors;

-- Anyone can read vendor profiles (for public vendor pages)
CREATE POLICY "Public can read vendor profiles"
  ON vendors FOR SELECT
  USING (true);

-- Vendors can update their own record (activated_at, auth_user_id, email etc)
CREATE POLICY "Vendors can update own record"
  ON vendors FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());
