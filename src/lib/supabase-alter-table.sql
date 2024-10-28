-- Add affiliate columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS affiliate_type TEXT,
ADD COLUMN IF NOT EXISTS affiliate_link TEXT;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';