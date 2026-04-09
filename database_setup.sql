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

-- (Optional) Create policy to allow admins to view registrations, if you want only authenticated admins to read.
-- For now, we only need INSERT access.
