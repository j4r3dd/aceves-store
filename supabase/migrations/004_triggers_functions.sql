-- =====================================================
-- Phase 1: Database Triggers and Functions
-- =====================================================
-- Run this in Supabase SQL Editor
-- Migration: 004_triggers_functions.sql

-- =====================================================
-- TRIGGER 1: Auto-link guest orders when user registers
-- =====================================================
-- When a user creates an account, automatically link any
-- previous guest orders with the same email to their account

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS link_guest_orders_to_user();

CREATE OR REPLACE FUNCTION link_guest_orders_to_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Link all guest orders with matching email to this new user
  UPDATE orders
  SET user_id = NEW.id,
      is_guest = false
  WHERE customer_email = NEW.email
    AND user_id IS NULL
    AND is_guest = true;

  -- Update guest_emails table to mark as migrated
  UPDATE guest_emails
  SET migrated_to_user_id = NEW.id,
      updated_at = NOW()
  WHERE email = NEW.email
    AND migrated_to_user_id IS NULL;

  -- Log success
  RAISE NOTICE 'Linked guest orders for email: % to user: %', NEW.email, NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION link_guest_orders_to_user();

COMMENT ON FUNCTION link_guest_orders_to_user IS 'Automatically links guest orders to new user accounts when they register with the same email';

-- =====================================================
-- TRIGGER 2: Update user stats after order creation
-- =====================================================
-- When an order is created, update the user's profile
-- with total_orders and total_spent

DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP FUNCTION IF EXISTS update_user_stats_after_order();

CREATE OR REPLACE FUNCTION update_user_stats_after_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if order is linked to a user
  IF NEW.user_id IS NOT NULL THEN
    UPDATE profiles
    SET total_orders = total_orders + 1,
        total_spent = total_spent + NEW.total_amount,
        updated_at = NOW()
    WHERE id = NEW.user_id;

    RAISE NOTICE 'Updated stats for user: %', NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_after_order();

COMMENT ON FUNCTION update_user_stats_after_order IS 'Updates user profile statistics when a new order is created';

-- =====================================================
-- TRIGGER 3: Ensure only one default address per user
-- =====================================================
-- When an address is set as default, unset all others

DROP TRIGGER IF EXISTS on_address_default_update ON user_addresses;
DROP FUNCTION IF EXISTS ensure_single_default_address();

CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If this address is being set as default
  IF NEW.is_default = true THEN
    -- Unset all other addresses for this user
    UPDATE user_addresses
    SET is_default = false,
        updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_address_default_update
  BEFORE INSERT OR UPDATE ON user_addresses
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_address();

COMMENT ON FUNCTION ensure_single_default_address IS 'Ensures only one address per user is marked as default';

-- =====================================================
-- TRIGGER 4: Update timestamps automatically
-- =====================================================

-- Drop existing triggers first (including any on orders table)
DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON user_addresses;
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
DROP TRIGGER IF EXISTS update_user_discounts_updated_at ON user_discounts;
DROP TRIGGER IF EXISTS update_guest_emails_updated_at ON guest_emails;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Now drop the function with CASCADE to handle any other dependencies
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create the function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for new tables
CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_discounts_updated_at
  BEFORE UPDATE ON user_discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guest_emails_updated_at
  BEFORE UPDATE ON guest_emails
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Recreate trigger for orders table (if it had one before)
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically updates the updated_at timestamp on row updates';

-- =====================================================
-- UTILITY FUNCTION: Get user's active discount
-- =====================================================

DROP FUNCTION IF EXISTS get_user_active_discount(UUID);

CREATE OR REPLACE FUNCTION get_user_active_discount(p_user_id UUID)
RETURNS TABLE (
  discount_type TEXT,
  discount_value NUMERIC,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ud.discount_type,
    ud.discount_value,
    ud.reason
  FROM user_discounts ud
  WHERE ud.user_id = p_user_id
    AND ud.is_active = true
    AND (ud.valid_from IS NULL OR ud.valid_from <= NOW())
    AND (ud.valid_until IS NULL OR ud.valid_until >= NOW())
  ORDER BY ud.discount_value DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_active_discount IS 'Returns the highest active discount for a user (if any)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Successfully created triggers and functions:';
  RAISE NOTICE '   - link_guest_orders_to_user: Auto-links guest orders on registration';
  RAISE NOTICE '   - update_user_stats_after_order: Updates user stats on new order';
  RAISE NOTICE '   - ensure_single_default_address: Ensures only one default address';
  RAISE NOTICE '   - update_updated_at_column: Auto-updates timestamps';
  RAISE NOTICE '   - get_user_active_discount: Utility function for discounts';
END $$;
