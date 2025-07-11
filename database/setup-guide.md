# Database Setup Guide for MTCC BSC

## Step 1: Execute the Main Schema

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire content from `database/schema.sql`
4. Execute the script

This will create:
- All necessary tables with proper relationships
- Enum types for consistent data
- Indexes for performance
- Row Level Security policies
- Audit triggers
- 19 MTCC divisions with initial data

## Step 2: Verify the Setup

Run the following queries to verify everything was created correctly:

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if all divisions were created
SELECT * FROM divisions ORDER BY name;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

## Step 3: Create Your First Admin User

After setting up authentication, you'll need to create an admin user:

```sql
-- This will be run automatically when a user signs up
-- But you can manually insert test data if needed
INSERT INTO users (
    id, 
    username, 
    email, 
    first_name, 
    last_name, 
    role, 
    division_id, 
    is_active
) VALUES (
    'your-supabase-auth-uid',
    'admin',
    'admin@mtcc.com.mv',
    'System',
    'Administrator',
    'Admin',
    (SELECT id FROM divisions WHERE code = 'SPD'),
    true
);
```

## Step 4: Test Data (Optional)

If you want to populate the system with test data for development:

```sql
-- Sample Strategic Objectives
INSERT INTO strategic_objectives (name, description, perspective, division_id, owner_id, status) 
VALUES 
    ('Increase Revenue', 'Achieve 15% revenue growth', 'Financial', 
     (SELECT id FROM divisions WHERE code = 'FD'), 
     (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
     'Active'),
    ('Customer Satisfaction', 'Achieve 90% customer satisfaction', 'Customer', 
     (SELECT id FROM divisions WHERE code = 'CSD'), 
     (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
     'Active');

-- Sample KPI Definitions
INSERT INTO kpi_definitions (name, description, formula, frequency, units, target_value, threshold_green, threshold_yellow, threshold_red, owner_id, division_id)
VALUES 
    ('Revenue Growth Rate', 'Year over year revenue growth percentage', '((Current Year Revenue - Previous Year Revenue) / Previous Year Revenue) * 100', 'Quarterly', '%', 15.0, 15.0, 10.0, 5.0,
     (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
     (SELECT id FROM divisions WHERE code = 'FD')),
    ('Customer Satisfaction Score', 'Average customer satisfaction rating', 'AVG(satisfaction_ratings)', 'Monthly', 'Score', 4.5, 4.5, 4.0, 3.5,
     (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
     (SELECT id FROM divisions WHERE code = 'CSD'));
```

## Troubleshooting

### Common Issues:

1. **Permission Errors**: Make sure you're running the script as a database owner
2. **RLS Policies**: If you can't see data, check if RLS policies are correctly configured
3. **Foreign Key Constraints**: Ensure parent records exist before creating child records

### Reset Database (if needed):

```sql
-- WARNING: This will delete all data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

## Next Steps

After the database is set up:
1. Configure your `.env` file with Supabase credentials
2. Test the application login
3. Verify that divisions appear in the application
4. Create your first strategic objective through the UI