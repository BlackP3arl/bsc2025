import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthContext } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRole = []
}) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="mtcc-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // SECURITY: Implement role-based access control
  // Special handling for admin users - fallback for setup issues
  const isAdminEmail = user.email === 'salle.kma@gmail.com' || user.email === 'admin@mtcc.com.mv';
  const isAdminRole = user.role === 'Admin' || user.role === 'admin';
  
  if (requiredRole.length > 0 && (!user.role || !requiredRole.includes(user.role))) {
    // Allow admin emails or admin role as fallback
    if (isAdminEmail || isAdminRole) {
      console.warn('Admin user detected with missing/incorrect role, allowing access');
      return <>{children}</>;
    }
    
    console.warn(`Access denied: User role '${user.role || 'undefined'}' not in required roles:`, requiredRole);
    console.log('User object:', user);
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};