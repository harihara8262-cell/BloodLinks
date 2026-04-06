-- -- BloodLinks Supabase Schema Migration
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    google_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(LOWER(username));

-- Create donors table
CREATE TABLE IF NOT EXISTS donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    gender TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    blood_group TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    available BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_donors_blood_group ON donors(blood_group);
CREATE INDEX IF NOT EXISTS idx_donors_available ON donors(available);
CREATE INDEX IF NOT EXISTS idx_donors_location ON donors USING GIST(location);

-- Create trigger to auto-update location from lat/lng
CREATE OR REPLACE FUNCTION update_donor_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_donor_location
    BEFORE INSERT OR UPDATE ON donors
    FOR EACH ROW
    EXECUTE FUNCTION update_donor_location();

-- Function to search nearby donors
CREATE OR REPLACE FUNCTION search_nearby_donors(
    p_blood_group TEXT,
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_radius_km DOUBLE PRECISION DEFAULT 5.0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    phone TEXT,
    email TEXT,
    gender TEXT,
    date_of_birth DATE,
    blood_group TEXT,
    address TEXT,
    city TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    available BOOLEAN,
    created_at TIMESTAMPTZ,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.name,
        d.phone,
        d.email,
        d.gender,
        d.date_of_birth,
        d.blood_group,
        d.address,
        d.city,
        d.latitude,
        d.longitude,
        d.available,
        d.created_at,
        ST_Distance(
            d.location,
            ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
        ) / 1000 AS distance_km
    FROM donors d
    WHERE 
        d.blood_group = p_blood_group
        AND d.available = TRUE
        AND ST_DWithin(
            d.location,
            ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
            p_radius_km * 1000  -- Convert km to meters
        )
    ORDER BY distance_km ASC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your Supabase setup)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- You may want to add RLS policies based on your security requirements
