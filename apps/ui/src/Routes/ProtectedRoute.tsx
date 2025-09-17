import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { IProtectedRouteProps } from '../interfaces/navigation/IProtectedRouteProps';
import { useAuth } from '../contexts/AuthContext';
import PageLoading from '../components/molecules/loading/PageLoading';

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ 
  isAllowed, 
  children, 
  redirectPath = "/",
  requireAuth = false,
  allowedRoles = []
}) => {
  const { authState, checkAuth } = useAuth();
  const { user, isLoading } = authState;
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    const performAuthCheck = async () => {
      if (requireAuth && !hasCheckedAuth && !isAuthenticated) {
        try {
          await checkAuth();
        } catch (error) {
          console.log('ProtectedRoute: Auth check failed, user not authenticated');
        } finally {
          setHasCheckedAuth(true);
        }
      } else {
        setHasCheckedAuth(true);
      }
    };

    performAuthCheck();
  }, [checkAuth, isAuthenticated, hasCheckedAuth, requireAuth]);

  if (requireAuth && (isLoading || !hasCheckedAuth)) {
    return (
      <PageLoading
        message="Verifying authentication..."
        variant="fullscreen"
        size="medium"
      />
    );
  }

  // Handle auth-based protection
  if (requireAuth) {
    console.log('ProtectedRoute: requireAuth mode - isAuthenticated =', isAuthenticated);
    
    // Redirect if not authenticated
    if (!isAuthenticated) {
      console.log('ProtectedRoute: User not authenticated, redirecting to:', redirectPath);
      return <Navigate to={redirectPath} replace />;
    }

    // Check role permissions if specified
    if (allowedRoles.length > 0 && user) {
      const hasPermission = allowedRoles.includes(user.role);
      if (!hasPermission) {
        console.log('ProtectedRoute: User role not allowed, redirecting to homepage');
        return <Navigate to="/" replace />;
      }
    }
  }

  if (isAllowed !== undefined) {
    console.log('ProtectedRoute: manual mode - isAllowed =', isAllowed, 'redirectPath =', redirectPath);
    
    if (!isAllowed) {
      console.log('ProtectedRoute: Access denied, redirecting to:', redirectPath);
      return <Navigate to={redirectPath} replace />;
    }
  }
  
  console.log('ProtectedRoute: Access granted, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;