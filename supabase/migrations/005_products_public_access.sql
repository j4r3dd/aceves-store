-- =====================================================
-- Products and Banners Public Access
-- =====================================================
-- Migration: 005_products_public_access.sql
-- This ensures products and banners can be read by anyone

-- Enable RLS on products and banners (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRODUCTS POLICIES
-- Anyone can view products (public catalog)
-- Only admins can create/update/delete products
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- BANNERS POLICIES
-- Anyone can view active banners
-- Only admins can manage banners
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active banners" ON banners;
CREATE POLICY "Anyone can view active banners" ON banners
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins can view all banners" ON banners;
CREATE POLICY "Admins can view all banners" ON banners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert banners" ON banners;
CREATE POLICY "Admins can insert banners" ON banners
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update banners" ON banners;
CREATE POLICY "Admins can update banners" ON banners
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete banners" ON banners;
CREATE POLICY "Admins can delete banners" ON banners
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Successfully created RLS policies for products and banners';
  RAISE NOTICE '   - Products are publicly viewable';
  RAISE NOTICE '   - Banners are publicly viewable when active';
  RAISE NOTICE '   - Only admins can manage products and banners';
END $$;
