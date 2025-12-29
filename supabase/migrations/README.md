# Supabase Database Migrations

## Phase 1: User Accounts System - Database Schema

These SQL migration files set up the complete database schema for the user accounts system.

## How to Run Migrations

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run each migration file **in order**:

### Migration Order

Run these in sequence:

#### 1. `001_create_user_tables.sql`
Creates 5 new tables:
- `user_addresses` - Multiple shipping addresses per user
- `coupons` - Promotional discount codes
- `user_coupons` - Track coupon usage per user
- `user_discounts` - User-specific ongoing discounts
- `guest_emails` - Guest email capture for marketing

**Expected result**: 5 new tables created with indexes

---

#### 2. `002_modify_existing_tables.sql`
Modifies existing tables:
- `orders` - Adds user_id, coupon tracking, shipping status, tracking number
- `profiles` - Adds customer metadata (total_orders, total_spent, etc.)

**Expected result**: Existing tables updated with new columns

---

#### 3. `003_row_level_security.sql`
Sets up Row Level Security (RLS) policies:
- Users can only access their own data
- Admins have full access
- Guest orders viewable by matching email

**Expected result**: All tables secured with RLS policies

---

#### 4. `004_triggers_functions.sql`
Creates database triggers and utility functions:
- Auto-link guest orders when user registers
- Update user stats on new order
- Ensure only one default address
- Auto-update timestamps

**Expected result**: 4 triggers and 1 utility function created

---

#### 5. `005_products_public_access.sql`
Sets up RLS policies for public catalog access:
- Products table - publicly readable, admin-only write
- Banners table - publicly readable when active, admin-only write

**Expected result**: Products and banners accessible to anonymous users

**⚠️ IMPORTANT**: Run this migration to fix cart functionality! Without it, anonymous users cannot view products.

---

## Verification

After running all migrations, verify:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'user_addresses',
  'coupons',
  'user_coupons',
  'user_discounts',
  'guest_emails'
);

-- Check orders table has new columns
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN (
  'user_id',
  'shipping_status',
  'coupon_code',
  'tracking_number'
);

-- Check triggers are created
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

## Rollback (if needed)

If you need to undo the migrations:

```sql
-- Drop new tables
DROP TABLE IF EXISTS user_coupons CASCADE;
DROP TABLE IF EXISTS user_discounts CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS guest_emails CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;

-- Remove columns from existing tables
ALTER TABLE orders
  DROP COLUMN IF EXISTS user_id,
  DROP COLUMN IF EXISTS coupon_code,
  DROP COLUMN IF EXISTS coupon_discount,
  DROP COLUMN IF EXISTS user_discount,
  DROP COLUMN IF EXISTS original_total,
  DROP COLUMN IF EXISTS shipping_status,
  DROP COLUMN IF EXISTS shipped_at,
  DROP COLUMN IF EXISTS delivered_at,
  DROP COLUMN IF EXISTS tracking_number;

ALTER TABLE profiles
  DROP COLUMN IF EXISTS customer_since,
  DROP COLUMN IF EXISTS total_orders,
  DROP COLUMN IF EXISTS total_spent,
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS newsletter_subscribed;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP TRIGGER IF EXISTS on_address_default_update ON user_addresses;

-- Drop functions
DROP FUNCTION IF EXISTS link_guest_orders_to_user();
DROP FUNCTION IF EXISTS update_user_stats_after_order();
DROP FUNCTION IF EXISTS ensure_single_default_address();
DROP FUNCTION IF EXISTS get_user_active_discount(UUID);
```

## Notes

- All migrations use `IF NOT EXISTS` and `IF EXISTS` to be idempotent
- You can safely re-run migrations if needed
- Each migration includes success messages via `RAISE NOTICE`
- RLS policies ensure data security at the database level
- Triggers automate common operations (linking orders, updating stats)
