-- Create health conditions table if it doesn't exist
CREATE TABLE IF NOT EXISTS health_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
    common_symptoms TEXT[],
    dietary_restrictions TEXT[],
    exercise_restrictions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE health_conditions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for health conditions" ON health_conditions;
DROP POLICY IF EXISTS "Admin write access for health conditions" ON health_conditions;

-- Create policies
CREATE POLICY "Public read access for health conditions"
    ON health_conditions FOR SELECT
    USING (true);

CREATE POLICY "Admin write access for health conditions"
    ON health_conditions FOR ALL
    USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
    WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

-- Insert initial health conditions if they don't exist
INSERT INTO health_conditions (name, description, severity, common_symptoms, dietary_restrictions, exercise_restrictions)
VALUES
    ('Hip Dysplasia', 'A genetic condition affecting hip joints', 'moderate', 
     ARRAY['Difficulty rising', 'Decreased activity', 'Limping'], 
     ARRAY['Joint supplements recommended'], 
     ARRAY['Avoid high-impact activities'])
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_conditions_name ON health_conditions(name);
CREATE INDEX IF NOT EXISTS idx_health_conditions_severity ON health_conditions(severity);