-- Drop existing tables if they exist
DROP TABLE IF EXISTS product_life_stages CASCADE;
DROP TABLE IF EXISTS product_size_suitability CASCADE;
DROP TABLE IF EXISTS product_health_benefits CASCADE;
DROP TABLE IF EXISTS product_breed_recommendations CASCADE;

-- Create product life stages table
CREATE TABLE product_life_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    suitable_for_puppy BOOLEAN DEFAULT false,
    suitable_for_adult BOOLEAN DEFAULT false,
    suitable_for_senior BOOLEAN DEFAULT false,
    min_age_months INTEGER,
    max_age_months INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product size suitability table
CREATE TABLE product_size_suitability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    suitable_for_small BOOLEAN DEFAULT false,
    suitable_for_medium BOOLEAN DEFAULT false,
    suitable_for_large BOOLEAN DEFAULT false,
    suitable_for_giant BOOLEAN DEFAULT false,
    min_weight_kg DECIMAL(5,2),
    max_weight_kg DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product health benefits table
CREATE TABLE product_health_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    health_condition_id UUID REFERENCES health_conditions(id) ON DELETE CASCADE,
    benefit_description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product breed recommendations table
CREATE TABLE product_breed_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    breed_id UUID REFERENCES dog_breeds(id) ON DELETE CASCADE,
    recommendation_strength INTEGER CHECK (recommendation_strength BETWEEN 1 AND 5),
    recommendation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add additional columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS ingredients TEXT[],
ADD COLUMN IF NOT EXISTS nutritional_info JSONB,
ADD COLUMN IF NOT EXISTS features TEXT[],
ADD COLUMN IF NOT EXISTS safety_warnings TEXT[],
ADD COLUMN IF NOT EXISTS activity_level_suitable INTEGER[] CHECK (
    array_length(activity_level_suitable, 1) IS NULL OR
    (
        array_length(activity_level_suitable, 1) = 2 AND
        activity_level_suitable[1] >= 1 AND
        activity_level_suitable[2] <= 10 AND
        activity_level_suitable[1] < activity_level_suitable[2]
    )
);

-- Enable RLS
ALTER TABLE product_life_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_size_suitability ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_health_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_breed_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for product metadata"
    ON product_life_stages FOR SELECT
    USING (true);

CREATE POLICY "Public read access for product size suitability"
    ON product_size_suitability FOR SELECT
    USING (true);

CREATE POLICY "Public read access for product health benefits"
    ON product_health_benefits FOR SELECT
    USING (true);

CREATE POLICY "Public read access for product breed recommendations"
    ON product_breed_recommendations FOR SELECT
    USING (true);

-- Admin write access policies
CREATE POLICY "Admin write access for product life stages"
    ON product_life_stages FOR ALL
    USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
    WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

CREATE POLICY "Admin write access for product size suitability"
    ON product_size_suitability FOR ALL
    USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
    WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

CREATE POLICY "Admin write access for product health benefits"
    ON product_health_benefits FOR ALL
    USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
    WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

CREATE POLICY "Admin write access for product breed recommendations"
    ON product_breed_recommendations FOR ALL
    USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
    WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

-- Create indexes
CREATE INDEX idx_product_life_stages_product ON product_life_stages(product_id);
CREATE INDEX idx_product_size_suitability_product ON product_size_suitability(product_id);
CREATE INDEX idx_product_health_benefits_product ON product_health_benefits(product_id);
CREATE INDEX idx_product_breed_recommendations_product ON product_breed_recommendations(product_id);
CREATE INDEX idx_product_breed_recommendations_breed ON product_breed_recommendations(breed_id);