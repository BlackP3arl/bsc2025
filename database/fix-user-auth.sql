-- Fix User Authentication Integration
-- This script fixes the integration between Supabase Auth and our users table

-- First, let's update the users table to handle Supabase Auth UUIDs properly
-- Drop the foreign key constraint temporarily
ALTER TABLE divisions DROP CONSTRAINT IF EXISTS fk_division_head;

-- Update the users table to allow Auth UUIDs
-- Note: We need to keep existing UUIDs, but also allow Auth UUIDs

-- Create a function to handle user registration automatically
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = NEW.email) THEN
    -- Create user record with special handling for admin email
    INSERT INTO public.users (id, username, email, first_name, last_name, role, division_id, is_active)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', 
               CASE WHEN NEW.email = 'salle.kma@gmail.com' THEN 'Salle' ELSE 'User' END),
      COALESCE(NEW.raw_user_meta_data->>'last_name', 
               CASE WHEN NEW.email = 'salle.kma@gmail.com' THEN 'KMA' ELSE 'Name' END),
      CASE WHEN NEW.email = 'salle.kma@gmail.com' THEN 'Admin' ELSE 'User' END,
      (SELECT id FROM divisions WHERE code = 'SPD' LIMIT 1),
      TRUE
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the admin user exists and has the right role
INSERT INTO users (id, username, email, first_name, last_name, role, division_id, is_active) 
VALUES (
  gen_random_uuid(), -- Generate a UUID for non-auth users
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

-- Re-add the foreign key constraint
ALTER TABLE divisions ADD CONSTRAINT fk_division_head 
    FOREIGN KEY (head_id) REFERENCES users(id);

-- Verify the setup
SELECT 'User setup verification:' as message;
SELECT username, email, role, is_active FROM users WHERE email = 'salle.kma@gmail.com';