-- Add slug column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Generate slugs for existing products
UPDATE products
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;
