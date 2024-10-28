-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON reviews FOR SELECT USING (true);

-- Create policies for admin write access
CREATE POLICY "Enable write access for admin users" ON products 
FOR ALL 
USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

CREATE POLICY "Enable write access for admin users" ON categories 
FOR ALL 
USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

CREATE POLICY "Enable write access for admin users" ON reviews 
FOR ALL 
USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

-- Add affiliate columns to products table if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS affiliate_type TEXT,
ADD COLUMN IF NOT EXISTS affiliate_link TEXT;

-- Create admin user
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  role
) VALUES (
  'admin@pawfectfind.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  'authenticated'
);