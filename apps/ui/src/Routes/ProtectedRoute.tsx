import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { IProtectedRouteProps } from '../interfaces/navigation/IProtectedRouteProps';
import { useAuth } from '../contexts/AuthContext';
import PageLoading from '../components/molecules/common/loading/PageLoading';

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

  if (requireAuth) {


    if (!isAuthenticated) {
 
      return <Navigate to={redirectPath} replace />;
    }

   
    if (allowedRoles.length > 0 && user) {
      const hasPermission = allowedRoles.includes(user.role);
      if (!hasPermission) {
        return <Navigate to="/" replace />;
      }
    }
  }

  if (isAllowed !== undefined) {
 
    
    if (!isAllowed) {

      return <Navigate to={redirectPath} replace />;
    }
  }
  return <>{children}</>;
};

export default ProtectedRoute;