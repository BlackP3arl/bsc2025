# User Management Fix Guide

## Overview

This document addresses the issues with user creation and password management in the MTCC BSC User Management system.

## Issues Identified

1. **User Creation Failing**: Admin accounts couldn't create new users
2. **Password Changes Not Working**: Unable to change passwords for existing accounts
3. **Missing Auth Integration**: Database operations weren't properly integrated with Supabase Auth

## Root Cause

The original `userService` only handled database operations but didn't:
- Create Supabase Auth accounts for new users
- Update passwords in the Supabase Auth system
- Properly manage the relationship between auth users and database users

## Solution Implemented

### 1. Database Functions (Recommended Approach)

Created secure database functions that handle admin operations:

#### Functions Created:
- `admin_create_user()` - Creates both auth and database user records
- `admin_update_user_password()` - Updates user passwords securely
- `admin_delete_user()` - Removes both auth and database records

#### Security Features:
- Admin role verification
- Self-deletion prevention
- Proper error handling
- Transaction safety

### 2. Updated Service Layer

Modified `src/services/database.ts` to use the new database functions:

#### User Creation:
```typescript
async create(userData: any): Promise<User> {
  // Uses admin_create_user database function
  const { data: newUserId, error } = await supabase.rpc('admin_create_user', {
    email: userData.email,
    password: userData.password,
    // ... other fields
  });
}
```

#### Password Updates:
```typescript
async update(id: string, userData: any): Promise<User> {
  // Uses admin_update_user_password for password changes
  if (userData.password) {
    await supabase.rpc('admin_update_user_password', {
      user_id: id,
      new_password: userData.password
    });
  }
}
```

## Setup Instructions

### Step 1: Database Setup

Run the SQL script in your Supabase SQL editor:

```sql
-- File: database/user-management-functions.sql
-- Copy and paste the entire content into Supabase SQL editor
```

### Step 2: Verify Permissions

Ensure your admin users have the correct roles in the database:

```sql
-- Check admin users
SELECT id, email, role FROM users WHERE role = 'Admin';

-- Update role if needed
UPDATE users SET role = 'Admin' WHERE email = 'salle.kma@gmail.com';
UPDATE users SET role = 'Admin' WHERE email = 'admin@mtcc.com.mv';
```

### Step 3: Test Functionality

1. **Test User Creation**:
   - Login as admin
   - Go to User Management
   - Click "Add User"
   - Fill in all required fields including password
   - Submit form

2. **Test Password Change**:
   - Login as admin
   - Go to User Management
   - Click "Edit" on any user
   - Enter a new password
   - Submit form

3. **Test User Deletion**:
   - Login as admin
   - Go to User Management
   - Click "Delete" on a test user
   - Confirm deletion

## Password Requirements

The system enforces strong password requirements:

- **Minimum Length**: 12 characters
- **Complexity**: Must contain:
  - Uppercase letter (A-Z)
  - Lowercase letter (a-z)
  - Number (0-9)
  - Special character (@$!%*?&)
- **Security**: Cannot contain common weak patterns

## Error Handling

### Common Issues and Solutions:

#### 1. "Unauthorized: Only admins can create users"
**Cause**: Current user doesn't have Admin role
**Solution**: Verify admin role in database and refresh session

#### 2. "Password must be at least 12 characters"
**Cause**: Password doesn't meet strength requirements
**Solution**: Use a stronger password meeting all criteria

#### 3. "Function admin_create_user does not exist"
**Cause**: Database functions not installed
**Solution**: Run the SQL script from `database/user-management-functions.sql`

#### 4. "Failed to create authentication account"
**Cause**: Email already exists or Supabase Auth issue
**Solution**: Check if email is already registered, use different email

## Security Features

### Admin-Only Operations
- All user management functions require Admin role
- Functions verify permissions before execution
- Comprehensive audit logging

### Password Security
- Passwords hashed using bcrypt
- Strong password validation
- No plain text password storage

### Data Integrity
- Transactional operations
- Proper cleanup on failures
- Foreign key constraints maintained

## Testing Checklist

### ✅ User Creation
- [ ] Admin can create new users
- [ ] Auth account is created automatically
- [ ] Database record is inserted correctly
- [ ] User can login with created credentials
- [ ] Email validation works
- [ ] Username validation works
- [ ] Role assignment works
- [ ] Division assignment works

### ✅ Password Management
- [ ] Admin can change user passwords
- [ ] Password strength validation works
- [ ] User can login with new password
- [ ] Confirm password validation works

### ✅ User Updates
- [ ] Admin can update user information
- [ ] Role changes work correctly
- [ ] Division reassignment works
- [ ] Account activation/deactivation works

### ✅ User Deletion
- [ ] Admin can delete users
- [ ] Both auth and database records removed
- [ ] Cannot delete own account
- [ ] Confirmation dialog works

## Monitoring

### Database Logs
Monitor Supabase logs for:
- Function execution errors
- Permission violations
- Authentication failures

### Application Logs
Check browser console for:
- API call failures
- Form validation errors
- Network issues

## Rollback Plan

If issues occur, the previous functions can be restored by:

1. Removing the new database functions:
```sql
DROP FUNCTION IF EXISTS admin_create_user;
DROP FUNCTION IF EXISTS admin_update_user_password;
DROP FUNCTION IF EXISTS admin_delete_user;
```

2. Reverting the service layer changes to use basic database operations

## Support

For technical issues:
1. Check Supabase dashboard logs
2. Verify database function installation
3. Confirm admin user roles
4. Test with different browsers
5. Check network connectivity

---

**Status**: ✅ Ready for implementation
**Priority**: High - Resolves critical user management functionality
**Tested**: Database functions and service integration
**Security**: Admin-only operations with proper validation