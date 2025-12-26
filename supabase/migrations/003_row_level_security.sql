-- =====================================================
-- Phase 1: Row Level Security (RLS) Policies
-- =====================================================
-- Run this in Supabase SQL Editor
-- Migration: 003_row_level_security.sql

-- Enable RLS on all new tables
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER_ADDRESSES POLICIES
-- Users can only see and manage their own addresses
-- =====================================================

DROP POLICY IF EXISTS "Users can view own addresses" ON user_addresses;
CREATE POLICY "Users can view own addresses" ON user_addresses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON user_addresses;
CREATE POLICY "Users can insert own addresses" ON user_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON user_addresses;
CREATE POLICY "Users can update own addresses" ON user_addresses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON user_addresses;
CREATE POLICY "Users can delete own addresses" ON user_addresses
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- ORDERS POLICIES
-- Users can view their own orders + guests can view by email
-- =====================================================

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id
    OR
    (is_guest = true AND customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Admin can view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can update order status
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- COUPONS POLICIES
-- Anyone can view active coupons
-- Only admins can create/update coupons
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
CREATE POLICY "Anyone can view active coupons" ON coupons
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can view all coupons" ON coupons;
CREATE POLICY "Admins can view all coupons" ON coupons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert coupons" ON coupons;
CREATE POLICY "Admins can insert coupons" ON coupons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update coupons" ON coupons;
CREATE POLICY "Admins can update coupons" ON coupons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete coupons" ON coupons;
CREATE POLICY "Admins can delete coupons" ON coupons
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- USER_COUPONS POLICIES
-- Users can view their own coupon usage
-- =====================================================

DROP POLICY IF EXISTS "Users can view own coupon usage" ON user_coupons;
CREATE POLICY "Users can view own coupon usage" ON user_coupons
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own coupon usage" ON user_coupons;
CREATE POLICY "Users can insert own coupon usage" ON user_coupons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- USER_DISCOUNTS POLICIES
-- Users can view their own discounts
-- Only admins can create/update user discounts
-- =====================================================

DROP POLICY IF EXISTS "Users can view own discounts" ON user_discounts;
CREATE POLICY "Users can view own discounts" ON user_discounts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage user discounts" ON user_discounts;
CREATE POLICY "Admins can manage user discounts" ON user_discounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- GUEST_EMAILS POLICIES
-- Only admins can view guest emails
-- =====================================================

DROP POLICY IF EXISTS "Admins can view guest emails" ON guest_emails;
CREATE POLICY "Admins can view guest emails" ON guest_emails
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Successfully created RLS policies for all tables';
  RAISE NOTICE '   - Users can only access their own data';
  RAISE NOTICE '   - Admins have full access to manage system';
  RAISE NOTICE '   - Guest orders are viewable by matching email';
END $$;
