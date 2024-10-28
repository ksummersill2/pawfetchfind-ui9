-- Drop existing breed_life_stages table and recreate with updated schema
DROP TABLE IF EXISTS breed_life_stages CASCADE;

CREATE TABLE breed_life_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    breed_id UUID REFERENCES dog_breeds(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL CHECK (stage_name IN ('puppy', 'adult', 'senior')),
    -- Age ranges
    start_age_months INTEGER NOT NULL,
    end_age_months INTEGER NOT NULL,
    -- Weight information
    average_weight_kg DECIMAL(5,2) NOT NULL,
    min_weight_kg DECIMAL(5,2) NOT NULL,
    max_weight_kg DECIMAL(5,2) NOT NULL,
    -- Activity level multipliers
    low_activity_multiplier DECIMAL(3,2) NOT NULL,
    medium_activity_multiplier DECIMAL(3,2) NOT NULL,
    high_activity_multiplier DECIMAL(3,2) NOT NULL,
    very_high_activity_multiplier DECIMAL(3,2) NOT NULL,
    -- Base calorie requirements
    base_calories_per_kg INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_age_range CHECK (start_age_months < end_age_months),
    CONSTRAINT valid_weight_range CHECK (min_weight_kg < max_weight_kg),
    CONSTRAINT valid_average_weight CHECK (
        average_weight_kg >= min_weight_kg AND 
        average_weight_kg <= max_weight_kg
    ),
    CONSTRAINT valid_activity_multipliers CHECK (
        low_activity_multiplier > 0 AND
        medium_activity_multiplier > low_activity_multiplier AND
        high_activity_multiplier > medium_activity_multiplier AND
        very_high_activity_multiplier > high_activity_multiplier
    )
);

-- Update the calorie calculation function
CREATE OR REPLACE FUNCTION calculate_daily_calories(
    breed_id UUID,
    age_months INTEGER,
    weight_kg DECIMAL,
    activity_level INTEGER -- 1-10 scale
) RETURNS INTEGER AS $$
DECLARE
    stage_info RECORD;
    activity_multiplier DECIMAL;
    base_calories INTEGER;
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

    -- Determine activity multiplier based on activity level (1-10 scale)
    CASE
        WHEN activity_level <= 3 THEN
            activity_multiplier := stage_info.low_activity_multiplier;
        WHEN activity_level <= 5 THEN
            activity_multiplier := stage_info.medium_activity_multiplier;
        WHEN activity_level <= 7 THEN
            activity_multiplier := stage_info.high_activity_multiplier;
        ELSE
            activity_multiplier := stage_info.very_high_activity_multiplier;
    END CASE;

    -- Calculate base calories using weight and stage's base calories per kg
    base_calories := (weight_kg * stage_info.base_calories_per_kg)::INTEGER;
    
    -- Apply activity multiplier
    RETURN (base_calories * activity_multiplier)::INTEGER;
END;
$$ LANGUAGE plpgsql;

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