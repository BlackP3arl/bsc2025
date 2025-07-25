import { supabase } from '../lib/supabase';
import type { User } from '../types';

// User Management Service with proper Auth integration
export const userManagementService = {
  /**
   * Create a new user with Supabase Auth integration
   */
  async createUser(userData: any): Promise<User> {
    try {
      // Step 1: Create the authentication account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role,
            division_id: userData.division_id,
          }
        }
      });

      if (authError) {
        console.error('Auth signup failed:', authError);
        throw new Error(`Failed to create authentication account: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user returned from authentication service');
      }

      // Step 2: Create user record in our users table
      const dbUserData = {
        id: authData.user.id,
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || null,
        role: userData.role,
        division_id: userData.division_id,
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        auth_provider: 'email'
      };

      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .insert(dbUserData)
        .select()
        .single();
      
      if (dbError) {
        console.error('Database user creation failed:', dbError);
        throw new Error(`Failed to create user record: ${dbError.message}`);
      }
      
      return dbUser;
    } catch (error: any) {
      console.error('User creation failed:', error);
      throw error;
    }
  },

  /**
   * Update user information (non-auth fields)
   */
  async updateUser(id: string, userData: Partial<any>): Promise<User> {
    try {
      // Remove password-related fields for regular updates
      const { password, confirmPassword, ...dbUserData } = userData;

      const { data, error } = await supabase
        .from('users')
        .update(dbUserData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('User update failed:', error);
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error('User update failed:', error);
      throw error;
    }
  },

  /**
   * Change user password using auth context
   */
  async changeUserPassword(userId: string, newPassword: string): Promise<void> {
    try {
      // This approach uses a database function that should be created in Supabase
      const { error } = await supabase.rpc('admin_update_user_password', {
        user_id: userId,
        new_password: newPassword
      });

      if (error) {
        console.error('Password change failed:', error);
        throw new Error(`Failed to change password: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Password change failed:', error);
      throw error;
    }
  },

  /**
   * Delete user and associated auth account
   */
  async deleteUser(id: string): Promise<void> {
    try {
      // Delete user record from our users table
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (dbError) {
        console.error('Database user deletion failed:', dbError);
        throw dbError;
      }

      // Call database function to delete auth user
      const { error: authError } = await supabase.rpc('admin_delete_user', {
        user_id: id
      });
      
      if (authError) {
        console.warn('Failed to delete auth user:', authError);
        // Don't throw error here as the database record is already deleted
      }
    } catch (error: any) {
      console.error('User deletion failed:', error);
      throw error;
    }
  }
};