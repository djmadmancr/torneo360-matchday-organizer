
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'admin' | 'organizer' | 'referee' | 'team_admin';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const { currentUser, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // Check role-based access if roles are specified
  if (roles && roles.length > 0) {
    // Admin can access everything
    if (currentUser.role === 'admin') {
      return <>{children}</>;
    }
    
    // Check if user has required role
    if (!roles.includes(currentUser.role)) {
      return <Navigate to="/no-access" replace />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
