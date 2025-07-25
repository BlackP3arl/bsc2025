-- User Management Database Functions
-- These functions handle admin operations for user management

-- Function to update user password (admin only)
CREATE OR REPLACE FUNCTION admin_update_user_password(user_id UUID, new_password TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role 
  FROM users 
  WHERE id = auth.uid();
  
  IF current_user_role != 'Admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can change user passwords';
  END IF;
  
  -- Update the password in auth.users
  UPDATE auth.users 
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- Function to delete user (admin only)
CREATE OR REPLACE FUNCTION admin_delete_user(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role 
  FROM users 
  WHERE id = auth.uid();
  
  IF current_user_role != 'Admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
  END IF;
  
  -- Prevent self-deletion
  IF user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;
  
  -- Delete from auth.users (this will cascade to our users table)
  DELETE FROM auth.users WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- Function to create user with proper auth setup (admin only)
CREATE OR REPLACE FUNCTION admin_create_user(
  email TEXT,
  password TEXT,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  phone TEXT DEFAULT NULL,
  role TEXT DEFAULT 'User',
  division_id UUID DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role TEXT;
  new_user_id UUID;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role 
  FROM users 
  WHERE id = auth.uid();
  
  IF current_user_role != 'Admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can create users';
  END IF;
  
  -- Generate new user ID
  new_user_id := gen_random_uuid();
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    new_user_id,
    'authenticated',
    'authenticated',
    email,
    crypt(password, gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object(
      'first_name', first_name,
      'last_name', last_name,
      'role', role
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  -- Insert into our users table
  INSERT INTO users (
    id,
    username,
    email,
    first_name,
    last_name,
    phone,
    role,
    division_id,
    is_active,
    auth_provider
  ) VALUES (
    new_user_id,
    username,
    email,
    first_name,
    last_name,
    phone,
    role,
    division_id,
    is_active,
    'email'
  );
  
  RETURN new_user_id;
END;
$$;

-- Grant execute permissions to authenticated users (RLS will handle admin check)
GRANT EXECUTE ON FUNCTION admin_update_user_password(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_create_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, BOOLEAN) TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION admin_update_user_password(UUID, TEXT) IS 'Admin function to update user password';
COMMENT ON FUNCTION admin_delete_user(UUID) IS 'Admin function to delete user and auth account';
COMMENT ON FUNCTION admin_create_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, BOOLEAN) IS 'Admin function to create user with auth account';