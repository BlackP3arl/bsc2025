-- Admin User Setup Migration
-- This script ensures the admin user has proper access

-- Insert or update admin user with email salle.kma@gmail.com
INSERT INTO users (username, email, first_name, last_name, role, division_id, is_active) 
VALUES (
  'salle.kma', 
  'salle.kma@gmail.com', 
  'Salle', 
  'KMA', 
  'Admin', 
  (SELECT id FROM divisions WHERE code = 'SPD'), 
  TRUE
)
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'Admin',
  is_active = TRUE,
  updated_at = NOW();

-- Also ensure the user exists by auth ID if we have it
-- This handles cases where Supabase Auth user exists but not in our users table
DO $$
BEGIN
  -- Check if there's an auth user with this email and create user record if needed
  -- This is a fallback in case the user was created through Supabase Auth but not in our users table
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'salle.kma@gmail.com') THEN
    INSERT INTO users (username, email, first_name, last_name, role, division_id, is_active) 
    VALUES (
      'salle.kma', 
      'salle.kma@gmail.com', 
      'Salle', 
      'KMA', 
      'Admin', 
      (SELECT id FROM divisions WHERE code = 'SPD'), 
      TRUE
    );
  END IF;
END $$;

-- Update existing user to admin if they exist
UPDATE users 
SET role = 'Admin', is_active = TRUE, updated_at = NOW() 
WHERE email = 'salle.kma@gmail.com';

-- Verify the admin user exists and has correct role
SELECT 'Admin user setup completed:' as message, username, email, role, is_active
FROM users 
WHERE email = 'salle.kma@gmail.com';