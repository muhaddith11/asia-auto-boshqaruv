-- Create the services_list table
CREATE TABLE IF NOT EXISTS services_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price BIGINT NOT NULL,
    brand TEXT,
    car_model TEXT,
    stavka NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE services_list ENABLE ROW LEVEL SECURITY;

-- Create policies
-- 1. Allow public read access
CREATE POLICY "Allow public read" ON services_list
FOR SELECT USING (true);

-- 2. Allow all for authenticated/anon for now (matching current cars setup)
CREATE POLICY "Allow all for anon" ON services_list
FOR ALL USING (true);
