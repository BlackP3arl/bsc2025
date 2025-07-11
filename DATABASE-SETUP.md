# Database Setup Instructions

Your BSC application requires database tables to be created in your Supabase project. The tables don't exist yet, which is why you're seeing the error "relation does not exist".

## Quick Setup (5 minutes)

### Step 1: Go to Supabase Dashboard
1. Open your browser and go to: https://app.supabase.com/project/ksprlnhxkmzugqayctkw
2. Log in with your Supabase account

### Step 2: Open SQL Editor
1. In the left sidebar, click on "SQL Editor"
2. Click "New Query" to create a new SQL query

### Step 3: Create Database Tables
1. Copy the entire content from the file: `database/create-tables.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute the query

This will create:
- ✅ All required tables (divisions, users, strategic_objectives, strategic_initiatives, kpi_definitions, etc.)
- ✅ Sample data for 19 MTCC divisions
- ✅ Sample users, objectives, KPIs, and initiatives
- ✅ All necessary relationships and constraints

### Step 4: Verify Setup
After running the SQL:
1. Go to "Table Editor" in the left sidebar
2. You should see tables like: `divisions`, `users`, `strategic_objectives`, `strategic_initiatives`, `kpi_definitions`
3. Check that each table has sample data

### Step 5: Test the Application
1. Go back to your application at http://localhost:5174/
2. Try clicking on "Strategic Objectives", "KPIs", and "Initiatives"
3. You should now see the interfaces working with sample data

## What the Database Contains After Setup

### 19 MTCC Divisions
- Construction & Dredging Division (CDD)
- Transport Division (TD)
- Engineering & Docking Division (EDD)
- Finance Division (FD)
- Human Resources Division (HRD)
- And 14 more divisions...

### Sample Users
- System Administrator (admin@mtcc.com.mv)
- John Doe - Executive (john.doe@mtcc.com.mv)
- Jane Smith - Manager (jane.smith@mtcc.com.mv)
- Bob Wilson - Manager (bob.wilson@mtcc.com.mv)
- Alice Brown - User (alice.brown@mtcc.com.mv)

### Sample Strategic Objectives
- Increase Revenue by 15% (Financial perspective)
- Improve Customer Satisfaction (Customer perspective)
- Optimize Construction Efficiency (Internal perspective)
- Enhance Employee Skills (Learning & Growth perspective)

### Sample KPIs
- Revenue Growth Rate
- Customer Satisfaction Score
- Project Completion Time

### Sample Initiatives
- Digital Transformation Initiative
- Customer Experience Enhancement Program
- Construction Process Optimization

## Troubleshooting

If you encounter any issues:

1. **Check your Supabase project URL**: Make sure you're using the correct project
2. **Verify permissions**: Ensure you have owner/admin access to the Supabase project
3. **Check for SQL errors**: If any part of the script fails, check the error message in the SQL Editor
4. **Contact support**: If you need help, the error details will help troubleshoot

## After Database Setup

Once the database is set up, you can:
- ✅ View and manage Strategic Objectives
- ✅ Create and manage KPI definitions
- ✅ Track Strategic Initiatives
- ✅ Use full CRUD operations (Create, Read, Update, Delete)
- ✅ Filter and search across all modules
- ✅ See sample data to understand the system

The application is fully functional once the database tables are created!