import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCurrentUser } from '../hooks/useData';
import type { AuthState } from '../hooks/useAuth';

interface AuthContextType extends Omit<AuthState, 'user'> {
  user: any; // Our custom user object with role information
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  // Combine auth state with our custom user data
  const contextValue: AuthContextType = {
    ...auth,
    user: auth.session ? currentUser : null,
    loading: auth.loading || (auth.session ? userLoading : false)
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};