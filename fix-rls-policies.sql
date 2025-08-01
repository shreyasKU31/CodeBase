-- Fix RLS policies for Clerk authentication
-- Since we're not using Supabase Auth, we need to modify the policies

-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'projects', 'project_likes', 'project_comments');

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read public profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Anyone can read public projects" ON projects;
DROP POLICY IF EXISTS "Users can read own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

DROP POLICY IF EXISTS "Anyone can read likes" ON project_likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON project_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON project_likes;

DROP POLICY IF EXISTS "Anyone can read comments" ON project_comments;
DROP POLICY IF EXISTS "Users can insert own comments" ON project_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON project_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON project_comments;

-- Create new policies that work without Supabase Auth
-- For now, we'll allow all operations (you can restrict this later)

-- Users table policies
CREATE POLICY "Allow all users operations" ON users FOR ALL USING (true) WITH CHECK (true);

-- Projects table policies  
CREATE POLICY "Allow all projects operations" ON projects FOR ALL USING (true) WITH CHECK (true);

-- Project likes table policies
CREATE POLICY "Allow all likes operations" ON project_likes FOR ALL USING (true) WITH CHECK (true);

-- Project comments table policies
CREATE POLICY "Allow all comments operations" ON project_comments FOR ALL USING (true) WITH CHECK (true);

-- Alternative: If you want to disable RLS completely for development
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_likes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_comments DISABLE ROW LEVEL SECURITY; 