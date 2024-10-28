-- Drop existing table if it exists
DROP TABLE IF EXISTS product_ratings CASCADE;

-- Create product ratings table with UUID types
CREATE TABLE product_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_product_ratings_product ON product_ratings(product_id);
CREATE INDEX idx_product_ratings_user ON product_ratings(user_id);

-- Enable RLS
ALTER TABLE product_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for ratings"
    ON product_ratings FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can rate products"
    ON product_ratings FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own ratings"
    ON product_ratings FOR UPDATE
    USING (auth.uid()::text = user_id::text);

-- Add average rating and count columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Create function to update product rating statistics
CREATE OR REPLACE FUNCTION update_product_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        avg_rating = (
            SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
            FROM product_ratings
            WHERE product_id = NEW.product_id
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM product_ratings
            WHERE product_id = NEW.product_id
        )
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating statistics updates
DROP TRIGGER IF EXISTS update_product_rating_stats_trigger ON product_ratings;
CREATE TRIGGER update_product_rating_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON product_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating_stats();