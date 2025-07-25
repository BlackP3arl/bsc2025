# Quarterly Commentary Setup Instructions

## Problem
The quarterly commentary functionality is failing with a 400 Bad Request error because the `quarterly_commentary` table doesn't exist in the database.

## Solution
You need to create the `quarterly_commentary` table in your Supabase database.

## Steps to Fix:

### Option 1: Using Supabase SQL Editor (Recommended)
1. Go to your Supabase dashboard at https://supabase.com/dashboard
2. Select your project
3. Go to the SQL Editor (left sidebar)
4. Copy and paste the SQL from `database/quarterly-commentary-simple.sql`
5. Click "Run" to execute the SQL

### Option 2: Using the SQL File
1. Open the file `database/quarterly-commentary-simple.sql`
2. Copy all the SQL code
3. Run it in your Supabase SQL editor

### What this creates:
- `quarterly_commentary` table with proper structure
- Indexes for performance
- Row Level Security policies
- Proper foreign key relationships

### After running the SQL:
1. Refresh your application
2. Try clicking "Add Commentary" again
3. The form should now work properly

## Table Structure Created:
```sql
CREATE TABLE quarterly_commentary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiative_id UUID NOT NULL REFERENCES strategic_initiatives(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    quarter VARCHAR(2) NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
    commentary TEXT NOT NULL,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(initiative_id, year, quarter)
);
```

## Testing:
After creating the table, test by:
1. Going to Quarterly Review page
2. Clicking "Add Commentary"
3. Selecting an initiative
4. Filling out the form
5. Submitting

The error should be resolved and the quarterly commentary system should work properly.