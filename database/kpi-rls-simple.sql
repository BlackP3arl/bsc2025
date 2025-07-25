-- Simple RLS Policies for KPI Tables
-- Run this in your Supabase SQL Editor

-- ==========================================
-- KPI DEFINITIONS TABLE RLS POLICIES
-- ==========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view KPI definitions" ON kpi_definitions;
DROP POLICY IF EXISTS "Admins can insert KPI definitions" ON kpi_definitions;
DROP POLICY IF EXISTS "Admins can update KPI definitions" ON kpi_definitions;
DROP POLICY IF EXISTS "Admins can delete KPI definitions" ON kpi_definitions;

-- Enable RLS
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view KPI definitions
CREATE POLICY "Users can view KPI definitions" ON kpi_definitions
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert/update/delete KPI definitions
-- (You can restrict this further based on your needs)
CREATE POLICY "Users can manage KPI definitions" ON kpi_definitions
FOR ALL
TO authenticated
USING (true);

-- ==========================================
-- KPI DATA TABLE RLS POLICIES
-- ==========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view KPI data" ON kpi_data;
DROP POLICY IF EXISTS "Users can insert KPI data" ON kpi_data;
DROP POLICY IF EXISTS "Users can update KPI data" ON kpi_data;
DROP POLICY IF EXISTS "Users can delete KPI data" ON kpi_data;

-- Enable RLS
ALTER TABLE kpi_data ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view KPI data
CREATE POLICY "Users can view KPI data" ON kpi_data
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert/update/delete KPI data
-- (You can restrict this further based on your needs)
CREATE POLICY "Users can manage KPI data" ON kpi_data
FOR ALL
TO authenticated
USING (true);

-- ==========================================
-- OBJECTIVE_KPIS TABLE RLS POLICIES
-- ==========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view objective-KPI relationships" ON objective_kpis;
DROP POLICY IF EXISTS "Users can manage objective-KPI relationships" ON objective_kpis;

-- Enable RLS
ALTER TABLE objective_kpis ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view objective-KPI relationships
CREATE POLICY "Users can view objective-KPI relationships" ON objective_kpis
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to manage objective-KPI relationships
CREATE POLICY "Users can manage objective-KPI relationships" ON objective_kpis
FOR ALL
TO authenticated
USING (true);