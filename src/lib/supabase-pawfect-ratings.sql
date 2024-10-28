-- Create pawfect ratings table
CREATE TABLE IF NOT EXISTS pawfect_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- Add pawfect_rating column to products table
ALTER TABLE products
ADD COLUMN pawfect_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN pawfect_rating_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE pawfect_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read pawfect ratings"
    ON pawfect_ratings FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create ratings"
    ON pawfect_ratings FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own ratings"
    ON pawfect_ratings FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to update pawfect rating average
CREATE OR REPLACE FUNCTION update_pawfect_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        pawfect_rating = (
            SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
            FROM pawfect_ratings
            WHERE product_id = NEW.product_id
        ),
        pawfect_rating_count = (
            SELECT COUNT(*)
            FROM pawfect_ratings
            WHERE product_id = NEW.product_id
        )
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for pawfect rating updates
CREATE TRIGGER update_pawfect_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON pawfect_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_pawfect_rating();