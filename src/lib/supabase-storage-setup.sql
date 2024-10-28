-- Create storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create buckets table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.buckets (
    id text PRIMARY KEY,
    name text NOT NULL,
    owner uuid REFERENCES auth.users,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    public boolean DEFAULT FALSE,
    avif_autodetection boolean DEFAULT FALSE,
    file_size_limit bigint,
    allowed_mime_types text[]
);

-- Create required buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('breeds', 'breeds', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Public Access"
ON storage.buckets FOR SELECT
USING (true);

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can upload breed images"
ON storage.buckets FOR INSERT
TO authenticated
WITH CHECK (
    id = 'breeds' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Admin can manage breed images"
ON storage.buckets FOR ALL
TO authenticated
USING (
    id = 'breeds'
    AND auth.jwt() ->> 'email' = 'admin@pawfectfind.com'
);