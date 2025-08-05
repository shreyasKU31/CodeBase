-- DevHance Database Reset Script
-- Run this in your Supabase SQL Editor to completely reset and recreate the database

-- WARNING: This will delete ALL existing data!
-- Only run this if you want to start fresh

-- Step 1: Drop all existing tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS project_comments CASCADE;
DROP TABLE IF EXISTS project_likes CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 3: Recreate everything with the correct schema
-- Enable UUID extension for project IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
-- Correctly designed for Clerk user IDs (TEXT format)
CREATE TABLE public.users (
    id TEXT PRIMARY KEY NOT NULL, -- Clerk user ID (e.g., user_30pGOUBT2PwJ6LSaeV525hkXqLj)
    username VARCHAR(30) UNIQUE NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    email TEXT,
    headline VARCHAR(100),
    location VARCHAR(50),
    profile_picture TEXT,
    bio TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    is_profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROJECTS TABLE
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    story TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    images TEXT[],
    videos TEXT[],
    tech_stack VARCHAR(50)[],
    github_url TEXT,
    live_url TEXT,
    figma_url TEXT,
    youtube_url TEXT,
    other_links JSONB,
    tags VARCHAR(50)[],
    author TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Links to Clerk user ID
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROJECT LIKES TABLE
CREATE TABLE public.project_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Links to Clerk user ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 4. PROJECT COMMENTS TABLE
CREATE TABLE public.project_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Links to Clerk user ID
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INDEXES for performance
CREATE INDEX idx_projects_author ON projects(author);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_project_likes_project_id ON project_likes(project_id);
CREATE INDEX idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 6. TRIGGER FUNCTION to automatically update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_comments_updated_at BEFORE UPDATE ON project_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. ROW LEVEL SECURITY (RLS) - DISABLED for Clerk integration
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments DISABLE ROW LEVEL SECURITY;

-- 8. Verify the schema
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'projects', 'project_likes', 'project_comments')
ORDER BY table_name, ordinal_position;

-- Success message
SELECT 'Database reset completed successfully! All tables recreated with correct schema.' as status; 