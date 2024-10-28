-- Drop existing table if it exists
DROP TABLE IF EXISTS dogs CASCADE;

-- Create dogs table with snake_case column names (PostgreSQL convention)
CREATE TABLE IF NOT EXISTS dogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    age NUMERIC(4,1) NOT NULL,
    weight NUMERIC(5,2) NOT NULL,
    activity_level INTEGER NOT NULL CHECK (activity_level BETWEEN 1 AND 10),
    image TEXT,
    health_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own dogs"
    ON dogs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create dogs"
    ON dogs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dogs"
    ON dogs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dogs"
    ON dogs FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_dogs_user_id ON dogs(user_id);
CREATE INDEX idx_dogs_breed ON dogs(breed);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_dogs_updated_at
    BEFORE UPDATE ON dogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();