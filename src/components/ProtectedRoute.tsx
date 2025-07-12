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
  if (requiredRole.length > 0 && (!user.role || !requiredRole.includes(user.role))) {
    console.warn(`Access denied: User role '${user.role || 'undefined'}' not in required roles:`, requiredRole);
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};