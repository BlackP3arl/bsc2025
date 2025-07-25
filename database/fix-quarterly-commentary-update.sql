-- Fix update RLS policy for quarterly commentary

-- Drop the existing update policy
DROP POLICY IF EXISTS "Allow users to update their own quarterly commentary" ON quarterly_commentary;

-- Create a more permissive update policy for testing
CREATE POLICY "Allow authenticated users to update quarterly commentary" ON quarterly_commentary
    FOR UPDATE USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Alternative: Create policy that allows updates for reviewers and admins
-- Uncomment this and comment the above if you want more restrictive policy
/*
CREATE POLICY "Allow reviewers and admins to update quarterly commentary" ON quarterly_commentary
    FOR UPDATE USING (
        reviewer_id = auth.uid() 
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('Executive', 'Admin'))
    )
    WITH CHECK (
        reviewer_id = auth.uid() 
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('Executive', 'Admin'))
    );
*/