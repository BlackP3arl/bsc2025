-- Add Azure AD specific fields to users table
-- This script adds columns to support Azure AD authentication

-- Add Azure ID column
ALTER TABLE users 
ADD COLUMN azure_id VARCHAR(255) UNIQUE;

-- Add Azure UPN (User Principal Name) column
ALTER TABLE users 
ADD COLUMN azure_upn VARCHAR(255) UNIQUE;

-- Add Azure domain column for multi-tenant support
ALTER TABLE users 
ADD COLUMN azure_domain VARCHAR(255);

-- Add last Azure login timestamp
ALTER TABLE users 
ADD COLUMN last_azure_login TIMESTAMPTZ;

-- Add authentication provider column
ALTER TABLE users 
ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'email';

-- Create index on Azure ID for faster lookups
CREATE INDEX idx_users_azure_id ON users(azure_id);

-- Create index on Azure UPN for faster lookups
CREATE INDEX idx_users_azure_upn ON users(azure_upn);

-- Add comments for documentation
COMMENT ON COLUMN users.azure_id IS 'Azure AD Object ID';
COMMENT ON COLUMN users.azure_upn IS 'Azure AD User Principal Name';
COMMENT ON COLUMN users.azure_domain IS 'Azure AD Domain';
COMMENT ON COLUMN users.last_azure_login IS 'Last successful Azure AD login';
COMMENT ON COLUMN users.auth_provider IS 'Authentication provider: email, azure, etc.';

-- Update existing admin user to support Azure
UPDATE users 
SET 
  auth_provider = 'email'
WHERE email = 'salle.kma@gmail.com' AND auth_provider IS NULL;

-- Show updated table structure
\d users;