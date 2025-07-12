-- Ensure admin user has correct role and access
-- This script fixes any issues with the admin user configuration

-- Update admin user if exists
UPDATE users 
SET 
  role = 'Admin',
  is_active = true,
  first_name = 'Admin',
  last_name = 'User'
WHERE email = 'salle.kma@gmail.com';

-- If admin user doesn't exist, create it (this should not happen with the current setup)
INSERT INTO users (
  id,
  username,
  email,
  first_name,
  last_name,
  role,
  division_id,
  is_active,
  created_at
)
SELECT 
  gen_random_uuid(),
  'admin',
  'salle.kma@gmail.com',
  'Admin',
  'User',
  'Admin',
  (SELECT id FROM divisions LIMIT 1),
  true,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'salle.kma@gmail.com'
);

-- Verify admin user configuration
SELECT 
  id,
  username,
  email,
  first_name,
  last_name,
  role,
  division_id,
  is_active
FROM users 
WHERE email = 'salle.kma@gmail.com';

-- Show all users for verification
SELECT 
  email,
  role,
  is_active,
  created_at
FROM users 
ORDER BY created_at;