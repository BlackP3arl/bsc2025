// Azure AD Authentication Service
import { supabase } from '../lib/supabase';

export interface AzureADConfig {
  clientId: string;
  tenantId: string;
  redirectUri: string;
  scopes: string[];
}

export class AzureAuthService {
  private static config: AzureADConfig = {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    tenantId: import.meta.env.VITE_AZURE_TENANT_ID || '',
    redirectUri: `${window.location.origin}/auth/callback`,
    scopes: ['openid', 'profile', 'email', 'User.Read']
  };

  private static getAuthorityUrl(): string {
    return `https://login.microsoftonline.com/${this.config.tenantId}`;
  }

  private static getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_mode: 'query',
      state: this.generateState()
    });

    return `${this.getAuthorityUrl()}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  private static generateState(): string {
    // Generate a random state parameter for CSRF protection
    const state = btoa(JSON.stringify({
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(2)
    }));
    
    // Store state in sessionStorage for verification
    sessionStorage.setItem('azure_auth_state', state);
    return state;
  }

  private static verifyState(receivedState: string): boolean {
    const storedState = sessionStorage.getItem('azure_auth_state');
    sessionStorage.removeItem('azure_auth_state');
    return storedState === receivedState;
  }

  static async signInWithAzure(): Promise<void> {
    try {
      // Clear any existing auth state
      sessionStorage.removeItem('azure_auth_state');
      
      // Redirect to Azure AD
      const authUrl = this.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Azure sign-in error:', error);
      throw new Error('Failed to initiate Azure sign-in');
    }
  }

  static async handleAuthCallback(code: string, state: string): Promise<any> {
    try {
      // Verify state parameter
      if (!this.verifyState(state)) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      // Exchange authorization code for tokens using Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            code,
            state
          }
        }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Azure auth callback error:', error);
      throw error;
    }
  }

  static async getAzureUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info from Microsoft Graph');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Azure user info:', error);
      throw error;
    }
  }

  static isAzureConfigured(): boolean {
    return !!(this.config.clientId && this.config.tenantId);
  }

  static getConfig(): AzureADConfig {
    return { ...this.config };
  }
}

// Enhanced user provisioning for Azure AD users
export const provisionAzureUser = async (azureUser: any, supabaseUser: any) => {
  try {
    // Check if user already exists in our database
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', azureUser.mail || azureUser.userPrincipalName)
      .single();

    if (existingUser) {
      // Update existing user with Azure info
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          azure_id: azureUser.id,
          azure_upn: azureUser.userPrincipalName,
          first_name: azureUser.givenName || existingUser.first_name,
          last_name: azureUser.surname || existingUser.last_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) throw error;
      return updatedUser;
    } else {
      // Create new user from Azure AD info
      const { data: divisions } = await supabase
        .from('divisions')
        .select('id')
        .limit(1)
        .single();

      // Determine role based on Azure AD info or default to User
      const role = determineUserRole(azureUser);

      const userData = {
        id: supabaseUser.id,
        username: azureUser.userPrincipalName?.split('@')[0] || azureUser.displayName?.replace(/\s+/g, '').toLowerCase(),
        email: azureUser.mail || azureUser.userPrincipalName,
        first_name: azureUser.givenName || 'Azure',
        last_name: azureUser.surname || 'User',
        role: role,
        division_id: divisions?.id,
        azure_id: azureUser.id,
        azure_upn: azureUser.userPrincipalName,
        is_active: true,
        created_at: new Date().toISOString()
      };

      const { data: newUser, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      return newUser;
    }
  } catch (error) {
    console.error('Error provisioning Azure user:', error);
    throw error;
  }
};

// Helper function to determine user role based on Azure AD information
const determineUserRole = (azureUser: any): string => {
  const email = azureUser.mail || azureUser.userPrincipalName || '';
  const displayName = azureUser.displayName || '';

  // Admin role for specific emails or if user is in admin group
  if (email.toLowerCase().includes('admin') || 
      displayName.toLowerCase().includes('admin') ||
      email === 'salle.kma@gmail.com') {
    return 'Admin';
  }

  // Manager role for management titles
  if (displayName.toLowerCase().includes('manager') ||
      displayName.toLowerCase().includes('director') ||
      displayName.toLowerCase().includes('head')) {
    return 'Manager';
  }

  // Executive role for C-level titles
  if (displayName.toLowerCase().includes('ceo') ||
      displayName.toLowerCase().includes('cfo') ||
      displayName.toLowerCase().includes('cto') ||
      displayName.toLowerCase().includes('executive')) {
    return 'Executive';
  }

  // Default to User role
  return 'User';
};