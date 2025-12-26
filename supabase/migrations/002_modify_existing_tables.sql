-- =====================================================
-- Phase 1: Modify Existing Tables (orders and profiles)
-- =====================================================
-- Run this in Supabase SQL Editor
-- Migration: 002_modify_existing_tables.sql

-- 1. MODIFY ORDERS TABLE
-- Add user account and discount tracking columns

-- Add user_id to link orders to registered users
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add coupon tracking
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC DEFAULT 0;

-- Add user-specific discount tracking
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS user_discount NUMERIC DEFAULT 0;

-- Store original total before discounts
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS original_total NUMERIC;

-- Add shipping status tracking (separate from payment status)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'pending' CHECK (shipping_status IN ('pending', 'paid', 'shipped', 'delivered'));

-- Add shipping timestamps
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Add tracking number
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Update existing orders to have shipping_status = 'paid' where status = 'paid'
UPDATE orders
SET shipping_status = 'paid'
WHERE status = 'paid' AND shipping_status IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(shipping_status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

COMMENT ON COLUMN orders.user_id IS 'Links order to registered user account (NULL for guest orders)';
COMMENT ON COLUMN orders.shipping_status IS 'Tracks order fulfillment: pending -> paid -> shipped -> delivered';
COMMENT ON COLUMN orders.original_total IS 'Total before any discounts were applied';

-- 2. MODIFY PROFILES TABLE
-- Add customer-specific fields

-- Add customer metadata
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS customer_since TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN DEFAULT true;

-- Ensure role defaults to 'customer' for new users
ALTER TABLE profiles
ALTER COLUMN role SET DEFAULT 'customer';

-- Update existing profiles without customer_since to use created date
UPDATE profiles
SET customer_since = NOW()
WHERE customer_since IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_customer_since ON profiles(customer_since);

COMMENT ON COLUMN profiles.customer_since IS 'Date when user created their account';
COMMENT ON COLUMN profiles.total_orders IS 'Total number of completed orders (updated via trigger)';
COMMENT ON COLUMN profiles.total_spent IS 'Total amount spent in MXN (updated via trigger)';
COMMENT ON COLUMN profiles.newsletter_subscribed IS 'Whether user wants to receive marketing emails';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Successfully modified orders and profiles tables with new columns and indexes';
END $$;
