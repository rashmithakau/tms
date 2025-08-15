import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';
import LoginPage from '../pages/LoginPage';
import SuperAdminPage from '../pages/SuperAdminPage';
import ProtectedRoute from './ProtectedRoute';
import ResetPasswordFirstLogin from '../pages/ResetPasswordFirstLogin';
import PasswordResetChangePasswordPage from '../pages/PasswordResetChangePasswordPage';
import PasswordResetPage from '../pages/PasswordResetPage';
import { UserRole } from '@tms/shared';

const AppRoute: React.FC = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('role');

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            isAllowed={isAuthenticated && userRole === 'admin'}
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
            isAllowed={isAuthenticated && userRole === 'superAdmin'}
            redirectPath="/"
          >
            <SuperAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forgotpassword"
        element={
          <ProtectedRoute
            isAllowed={localStorage.getItem('allowPasswordReset') === 'true'}
            redirectPath="/"
          >
            <PasswordResetPage />
          </ProtectedRoute>
        }
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
              (userRole === 'admin' ||
                userRole === 'superAdmin' ||
                userRole === 'emp' ||
                userRole === 'supervisor')
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
            <PasswordResetChangePasswordPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoute;
