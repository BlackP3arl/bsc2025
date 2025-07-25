import { supabase } from '../lib/supabase';

export const passwordService = {
  /**
   * Send password reset email to user (admin can trigger this for any user)
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Password reset email failed:', error);
      throw error;
    }
  },

  /**
   * Admin function to reset user password by sending them a reset email
   * This is a workaround since we can't directly change passwords without special permissions
   */
  async adminResetUserPassword(userEmail: string): Promise<void> {
    try {
      await this.sendPasswordResetEmail(userEmail);
    } catch (error: any) {
      console.error('Admin password reset failed:', error);
      throw error;
    }
  }
};