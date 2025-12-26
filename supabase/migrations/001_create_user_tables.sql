-- =====================================================
-- Phase 1: Create New Tables for User Accounts System
-- =====================================================
-- Run this in Supabase SQL Editor
-- Migration: 001_create_user_tables.sql

-- 1. USER_ADDRESSES TABLE
-- Store multiple shipping addresses per user
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  calle TEXT NOT NULL,
  colonia TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  cp TEXT NOT NULL,
  pais TEXT DEFAULT 'México',
  telefono TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, is_default);

COMMENT ON TABLE user_addresses IS 'Stores multiple shipping addresses for registered users';
COMMENT ON COLUMN user_addresses.is_default IS 'Only one address per user should be marked as default';

-- 2. COUPONS TABLE
-- Promotional discount codes
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_purchase_amount NUMERIC DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

COMMENT ON TABLE coupons IS 'Promotional discount codes for all users';
COMMENT ON COLUMN coupons.discount_type IS 'percentage = % off, fixed = fixed amount off in MXN';

-- 3. USER_COUPONS TABLE
-- Track coupon usage per user
CREATE TABLE IF NOT EXISTS user_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_id TEXT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ,
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, coupon_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_user_coupons_user ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_coupon ON user_coupons(coupon_id);

COMMENT ON TABLE user_coupons IS 'Tracks which users have used which coupons';

-- 4. USER_DISCOUNTS TABLE
-- User-specific ongoing discounts (loyalty, special offers, etc.)
CREATE TABLE IF NOT EXISTS user_discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_discounts_user ON user_discounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_discounts_active ON user_discounts(user_id, is_active);

COMMENT ON TABLE user_discounts IS 'User-specific discounts (different from coupons - these are assigned to specific users)';
COMMENT ON COLUMN user_discounts.reason IS 'Why this user got this discount (loyalty, compensation, special offer, etc.)';

-- 5. GUEST_EMAILS TABLE
-- Capture guest emails for marketing and order migration
CREATE TABLE IF NOT EXISTS guest_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_order_id TEXT,
  total_orders INTEGER DEFAULT 1,
  last_order_at TIMESTAMPTZ DEFAULT NOW(),
  migrated_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_emails_email ON guest_emails(email);
CREATE INDEX IF NOT EXISTS idx_guest_emails_migrated ON guest_emails(migrated_to_user_id);

COMMENT ON TABLE guest_emails IS 'Tracks guest checkout emails for marketing and automatic migration when they register';
COMMENT ON COLUMN guest_emails.migrated_to_user_id IS 'Set when guest creates an account - links their historical orders';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Successfully created 5 new tables: user_addresses, coupons, user_coupons, user_discounts, guest_emails';
END $$;
