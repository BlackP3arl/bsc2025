-- RLS Policies for KPI Tables
-- This script creates Row Level Security policies for kpi_definitions and kpi_data tables

-- ==========================================
-- KPI DEFINITIONS TABLE RLS POLICIES
-- ==========================================

-- Enable RLS on kpi_definitions table (if not already enabled)
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow all authenticated users to view KPI definitions
CREATE POLICY "Users can view KPI definitions" ON kpi_definitions
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow admins to insert KPI definitions
CREATE POLICY "Admins can insert KPI definitions" ON kpi_definitions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'Admin'
  )
);

-- Policy 3: Allow admins to update KPI definitions
CREATE POLICY "Admins can update KPI definitions" ON kpi_definitions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'Admin'
  )
);

-- Policy 4: Allow admins to delete KPI definitions
CREATE POLICY "Admins can delete KPI definitions" ON kpi_definitions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'Admin'
  )
);

-- ==========================================
-- KPI DATA TABLE RLS POLICIES
-- ==========================================

-- Enable RLS on kpi_data table (if not already enabled)
ALTER TABLE kpi_data ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow all authenticated users to view KPI data
CREATE POLICY "Users can view KPI data" ON kpi_data
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow users to insert KPI data for their division
CREATE POLICY "Users can insert KPI data for their division" ON kpi_data
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    JOIN kpi_definitions kd ON kd.id = kpi_data.kpi_id
    WHERE u.id = auth.uid() 
    AND (
      u.role = 'Admin' OR 
      u.division_id = kd.division_id
    )
  )
);

-- Policy 3: Allow users to update KPI data they entered or admins can update any
CREATE POLICY "Users can update their KPI data or admins can update any" ON kpi_data
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (
      role = 'Admin' OR 
      id = kpi_data.entered_by
    )
  )
);

-- Policy 4: Allow users to delete KPI data they entered or admins can delete any
CREATE POLICY "Users can delete their KPI data or admins can delete any" ON kpi_data
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (
      role = 'Admin' OR 
      id = kpi_data.entered_by
    )
  )
);

-- ==========================================
-- OBJECTIVE_KPIS TABLE RLS POLICIES (if needed)
-- ==========================================

-- Enable RLS on objective_kpis table (if not already enabled)
ALTER TABLE objective_kpis ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow all authenticated users to view objective-KPI relationships
CREATE POLICY "Users can view objective-KPI relationships" ON objective_kpis
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow admins to manage objective-KPI relationships
CREATE POLICY "Admins can manage objective-KPI relationships" ON objective_kpis
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'Admin'
  )
);

-- ==========================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ==========================================

-- Grant basic permissions to authenticated users
GRANT SELECT ON kpi_definitions TO authenticated;
GRANT SELECT ON kpi_data TO authenticated;
GRANT SELECT ON objective_kpis TO authenticated;

-- Grant additional permissions to authenticated users (policies will control access)
GRANT INSERT, UPDATE, DELETE ON kpi_definitions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON kpi_data TO authenticated;
GRANT INSERT, UPDATE, DELETE ON objective_kpis TO authenticated;

-- ==========================================
-- NOTES
-- ==========================================
-- 1. These policies assume that the auth.uid() function returns the user's ID
-- 2. The policies check user roles from the users table
-- 3. Admins have full access to all KPI-related data
-- 4. Regular users can view all KPI data but can only modify data for their division
-- 5. Users can only update/delete KPI data they entered themselves (unless admin)