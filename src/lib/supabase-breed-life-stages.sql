-- Create breed life stages table
CREATE TABLE IF NOT EXISTS breed_life_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    breed_id UUID REFERENCES dog_breeds(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL CHECK (stage_name IN ('puppy', 'adult', 'senior')),
    start_age_months INTEGER NOT NULL CHECK (start_age_months >= 0),
    end_age_months INTEGER CHECK (end_age_months > start_age_months OR end_age_months IS NULL),
    average_weight_kg DECIMAL(5,2) NOT NULL CHECK (average_weight_kg > 0),
    min_weight_kg DECIMAL(5,2) NOT NULL CHECK (min_weight_kg > 0),
    max_weight_kg DECIMAL(5,2) NOT NULL CHECK (max_weight_kg > min_weight_kg),
    low_activity_multiplier DECIMAL(3,2) NOT NULL CHECK (low_activity_multiplier > 0),
    medium_activity_multiplier DECIMAL(3,2) NOT NULL CHECK (medium_activity_multiplier > low_activity_multiplier),
    high_activity_multiplier DECIMAL(3,2) NOT NULL CHECK (high_activity_multiplier > medium_activity_multiplier),
    very_high_activity_multiplier DECIMAL(3,2) NOT NULL CHECK (very_high_activity_multiplier > high_activity_multiplier),
    base_calories_per_kg INTEGER NOT NULL CHECK (base_calories_per_kg > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_breed_life_stages_breed_id ON breed_life_stages(breed_id);

-- Create trigger for updated_at
CREATE TRIGGER update_breed_life_stages_updated_at
    BEFORE UPDATE ON breed_life_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE breed_life_stages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for breed life stages"
    ON breed_life_stages FOR SELECT
    USING (true);

CREATE POLICY "Admin write access for breed life stages"
    ON breed_life_stages FOR ALL
    USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
    WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');