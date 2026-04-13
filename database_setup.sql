-- WARNING: This script will reset your tables. Only run if you want a clean slate.
-- If you have data you want to keep, run these commands carefully.

-- 1. DROP EXISTING TABLES (Optional, use if you want to reset)
-- DROP TABLE IF EXISTS educators;
-- DROP TABLE IF EXISTS registrations;

-- 2. CREATE REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS registrations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  department text NOT NULL,
  survey_interest text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE EDUCATORS TABLE (Updated Structure)
-- If this table already exists with old columns, you must drop it first:
-- DROP TABLE educators; 

CREATE TABLE IF NOT EXISTS educators (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  workshop_title text NOT NULL,
  workshop_description text NOT NULL,
  duration text NOT NULL,
  format text NOT NULL,
  notes text,
  location text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SECURITY (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE educators ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES (Run these only if they don't exist, or drop them first)
-- To avoid "already exists" for policies, we use a DO block or just ignore errors if running manually.

DROP POLICY IF EXISTS "Allow anonymous inserts" ON registrations;
CREATE POLICY "Allow anonymous inserts" ON registrations FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous educator applications" ON educators;
CREATE POLICY "Allow anonymous educator applications" ON educators FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for everyone" ON educators;
CREATE POLICY "Enable read for everyone" ON educators FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read for registrations" ON registrations;
CREATE POLICY "Enable read for registrations" ON registrations FOR SELECT USING (true);

-- 6. CREATE SPEAKERS TABLE
CREATE TABLE IF NOT EXISTS speakers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name text NOT NULL,
  title text NOT NULL,
  company text NOT NULL,
  image_url text, -- Store public URL of the uploaded image
  linkedin_url text,
  order_index int DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read for speakers" ON speakers;
CREATE POLICY "Allow public read for speakers" ON speakers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin inserts for speakers" ON speakers;
CREATE POLICY "Allow admin inserts for speakers" ON speakers FOR INSERT TO anon WITH CHECK (true);
-- Note: In a real app, 'FOR INSERT' should be restricted to authenticated admins.
-- For now, following the pattern of this project.
