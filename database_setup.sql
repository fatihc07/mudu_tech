-- Run this in your Supabase SQL Editor to create the necessary table

CREATE TABLE registrations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  department text NOT NULL,
  survey_interest text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (since users will be unauthenticated when signing up)
CREATE POLICY "Allow anonymous inserts" ON registrations FOR INSERT TO anon WITH CHECK (true);

-- Educators Table
CREATE TABLE educators (
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

-- Enable RLS for educators
ALTER TABLE educators ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for educators
CREATE POLICY "Allow anonymous educator applications" ON educators FOR INSERT TO anon WITH CHECK (true);

-- Allow admins to read all (Assuming we will use a service role or specific admin policy later)
-- For now, we allow select to everyone for simplicity in the demo dashboard, 
-- but in production, we should restrict this to authenticated admins.
CREATE POLICY "Enable read for everyone" ON educators FOR SELECT USING (true);
CREATE POLICY "Enable read for registrations" ON registrations FOR SELECT USING (true);
