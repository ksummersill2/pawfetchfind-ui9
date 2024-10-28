-- Drop existing tables if they exist
DROP TABLE IF EXISTS breed_characteristics CASCADE;
DROP TABLE IF EXISTS breed_size_variations CASCADE;
DROP TABLE IF EXISTS dog_breeds CASCADE;

-- Create dog breeds table
CREATE TABLE dog_breeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    has_size_variations BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create breed size variations table
CREATE TABLE breed_size_variations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    breed_id UUID REFERENCES dog_breeds(id) ON DELETE CASCADE,
    size_category TEXT NOT NULL CHECK (size_category IN ('toy', 'mini', 'small', 'medium', 'standard', 'large', 'giant')),
    size_description TEXT,
    dietary_needs TEXT,
    health_issues TEXT[],
    care_instructions TEXT,
    special_considerations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(breed_id, size_category)
);

-- Create breed characteristics table
CREATE TABLE breed_characteristics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    breed_id UUID REFERENCES dog_breeds(id) ON DELETE CASCADE,
    size_variation_id UUID REFERENCES breed_size_variations(id) ON DELETE CASCADE,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    min_height_cm DECIMAL(5,2),
    max_height_cm DECIMAL(5,2),
    min_weight_kg DECIMAL(5,2),
    max_weight_kg DECIMAL(5,2),
    life_expectancy_years DECIMAL(3,1),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    grooming_needs INTEGER CHECK (grooming_needs BETWEEN 1 AND 10),
    shedding_level INTEGER CHECK (shedding_level BETWEEN 1 AND 10),
    trainability INTEGER CHECK (trainability BETWEEN 1 AND 10),
    barking_level INTEGER CHECK (barking_level BETWEEN 1 AND 10),
    good_with_children BOOLEAN DEFAULT true,
    good_with_other_dogs BOOLEAN DEFAULT true,
    good_with_strangers BOOLEAN DEFAULT true,
    exercise_needs_minutes INTEGER CHECK (exercise_needs_minutes > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_height_range CHECK (min_height_cm < max_height_cm),
    CONSTRAINT valid_weight_range CHECK (min_weight_kg < max_weight_kg),
    UNIQUE(breed_id, size_variation_id, gender)
);

-- Create indexes
CREATE INDEX idx_breed_size_variations_breed ON breed_size_variations(breed_id);
CREATE INDEX idx_breed_characteristics_breed ON breed_characteristics(breed_id);
CREATE INDEX idx_breed_characteristics_size ON breed_characteristics(size_variation_id);
CREATE INDEX idx_breed_characteristics_gender ON breed_characteristics(gender);

-- Enable RLS
ALTER TABLE dog_breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE breed_size_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE breed_characteristics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for breeds"
    ON dog_breeds FOR SELECT
    USING (true);

CREATE POLICY "Public read access for breed size variations"
    ON breed_size_variations FOR SELECT
    USING (true);

CREATE POLICY "Public read access for breed characteristics"
    ON breed_characteristics FOR SELECT
    USING (true);

CREATE POLICY "Admin write access for breeds"
    ON dog_breeds FOR ALL
    USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
    WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

CREATE POLICY "Admin write access for breed size variations"
    ON breed_size_variations FOR ALL
    USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
    WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

CREATE POLICY "Admin write access for breed characteristics"
    ON breed_characteristics FOR ALL
    USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
    WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_dog_breeds_updated_at
    BEFORE UPDATE ON dog_breeds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breed_size_variations_updated_at
    BEFORE UPDATE ON breed_size_variations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breed_characteristics_updated_at
    BEFORE UPDATE ON breed_characteristics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create views for male and female characteristics
CREATE OR REPLACE VIEW breed_characteristics_male AS
SELECT * FROM breed_characteristics WHERE gender = 'male';

CREATE OR REPLACE VIEW breed_characteristics_female AS
SELECT * FROM breed_characteristics WHERE gender = 'female';