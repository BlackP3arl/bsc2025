-- Fix Row Level Security policies for quarterly_commentary table

-- First, disable RLS temporarily to fix the policies
ALTER TABLE quarterly_commentary DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view quarterly commentary in their division" ON quarterly_commentary;
DROP POLICY IF EXISTS "Managers and above can add quarterly commentary" ON quarterly_commentary;
DROP POLICY IF EXISTS "Reviewers and above can update quarterly commentary" ON quarterly_commentary;
DROP POLICY IF EXISTS "Only admins can delete quarterly commentary" ON quarterly_commentary;

-- Re-enable RLS
ALTER TABLE quarterly_commentary ENABLE ROW LEVEL SECURITY;

-- Create more permissive policies for testing
-- Policy 1: Allow all authenticated users to view commentary (for testing)
CREATE POLICY "Allow authenticated users to view quarterly commentary" ON quarterly_commentary
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy 2: Allow all authenticated users to insert commentary (for testing)
CREATE POLICY "Allow authenticated users to add quarterly commentary" ON quarterly_commentary
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 3: Allow users to update their own commentary or if they're admin
CREATE POLICY "Allow users to update their own quarterly commentary" ON quarterly_commentary
    FOR UPDATE USING (
        reviewer_id = auth.uid() 
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('Executive', 'Admin'))
    );

-- Policy 4: Allow admins to delete commentary
CREATE POLICY "Allow admins to delete quarterly commentary" ON quarterly_commentary
    FOR DELETE USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'Admin')
    );

-- Grant necessary permissions
GRANT ALL ON quarterly_commentary TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;