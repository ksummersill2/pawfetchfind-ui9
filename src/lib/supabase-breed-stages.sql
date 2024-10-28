-- Create breed life stages table
CREATE TABLE IF NOT EXISTS breed_life_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    breed_id UUID REFERENCES dog_breeds(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL CHECK (stage_name IN ('puppy', 'junior', 'adult', 'senior', 'geriatric')),
    start_age_months INTEGER NOT NULL,
    end_age_months INTEGER NOT NULL,
    min_weight_kg DECIMAL(5,2) NOT NULL,
    max_weight_kg DECIMAL(5,2) NOT NULL,
    daily_calories_per_kg INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_age_range CHECK (start_age_months < end_age_months),
    CONSTRAINT valid_weight_range CHECK (min_weight_kg < max_weight_kg)
);

-- Add indexes
CREATE INDEX idx_breed_life_stages_breed ON breed_life_stages(breed_id);
CREATE INDEX idx_breed_life_stages_stage ON breed_life_stages(stage_name);

-- Enable RLS
ALTER TABLE breed_life_stages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read breed life stages"
    ON breed_life_stages FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify breed life stages"
    ON breed_life_stages FOR ALL
    USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
    WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

-- Create function to calculate daily calories
CREATE OR REPLACE FUNCTION calculate_daily_calories(
    breed_id UUID,
    age_months INTEGER,
    weight_kg DECIMAL
) RETURNS INTEGER AS $$
DECLARE
    stage_info RECORD;
    base_calories INTEGER;
    activity_multiplier DECIMAL;
BEGIN
    -- Get the life stage info for the breed and age
    SELECT *
    INTO stage_info
    FROM breed_life_stages
    WHERE breed_life_stages.breed_id = $1
    AND $2 BETWEEN start_age_months AND end_age_months
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Calculate base calories using the stage's calories per kg
    base_calories := (weight_kg * stage_info.daily_calories_per_kg)::INTEGER;

    RETURN base_calories;
END;
$$ LANGUAGE plpgsql;