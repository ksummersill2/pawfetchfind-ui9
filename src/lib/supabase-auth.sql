-- Create admin role if it doesn't exist
CREATE ROLE admin_role;

-- Grant necessary privileges to admin role
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO admin_role;

-- Create admin user and grant admin role
CREATE USER admin_user WITH PASSWORD 'your_secure_password';
GRANT admin_role TO admin_user;

-- Enable RLS on tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access" ON products
    FOR SELECT USING (true);

CREATE POLICY "Public read access" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Public read access" ON reviews
    FOR SELECT USING (true);

-- Admin write access policies
CREATE POLICY "Admin write access" ON products
    FOR ALL
    USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
    WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

CREATE POLICY "Admin write access" ON categories
    FOR ALL
    USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
    WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');

CREATE POLICY "Admin write access" ON reviews
    FOR ALL
    USING (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com')
    WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'admin@pawfectfind.com');