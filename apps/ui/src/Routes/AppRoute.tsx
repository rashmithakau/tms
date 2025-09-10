import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';
import LoginPage from '../pages/LoginPage';
import SuperAdminPage from '../pages/SuperAdminPage';
import ProtectedRoute from './ProtectedRoute';
import ResetPasswordFirstLogin from '../pages/ResetPasswordFirstLogin';
import ResetChangePasswordPage from '../pages/ResetChangePasswordPage';
import PasswordResetPage from '../pages/PasswordResetPage';
import { useAuth } from '../components/contexts/AuthContext';
import { UserRole } from '@tms/shared';
import PageLoading from '../components/molecules/PageLoading';
import EmployeePage from '../pages/EmployeePage';

const AppRoute: React.FC = () => {
  const { authState } = useAuth();
  const { isAuthenticated, user, isLoading } = authState;

  // Show loading while initializing auth state
  if (isLoading) {
    return (
      <PageLoading
        message="Initializing..."
        variant="fullscreen"
        size="medium"
      />
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            isAllowed={isAuthenticated && (user?.role === UserRole.Admin || user?.role === UserRole.SupervisorAdmin)}
            redirectPath="/"
          >
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute
            isAllowed={isAuthenticated && user?.role === UserRole.SuperAdmin}
            redirectPath="/"
          >
            <SuperAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee"
        element={
          <ProtectedRoute
            isAllowed={isAuthenticated && user?.role === UserRole.Emp || user?.role === UserRole.Supervisor}
            redirectPath="/"
          >
            <EmployeePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forgotpassword"
        element={<PasswordResetPage />}
      />
      <Route
        path="/resetpasswordfirstlogin"
        element={
          <ProtectedRoute
            isAllowed={localStorage.getItem('allowPasswordReset') === 'true'}
            redirectPath="/"
          >
            <ResetPasswordFirstLogin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute
            isAllowed={
              isAuthenticated &&
              (user?.role === UserRole.Admin ||
                user?.role === UserRole.SuperAdmin ||
                user?.role === UserRole.SupervisorAdmin ||
                user?.role === UserRole.Emp ||
                user?.role === UserRole.Supervisor)
            }
            redirectPath="/"
          >
            <ResetPasswordFirstLogin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resetpasswordchange"
        element={
          <ProtectedRoute
            isAllowed={localStorage.getItem('allowPasswordReset') === 'true'}
            redirectPath="/"
          >
            <ResetChangePasswordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/password/reset"
        element={<ResetChangePasswordPage />}
      />
    </Routes>
  );
};

export default AppRoute;
