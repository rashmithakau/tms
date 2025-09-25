import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';
import LoginPage from '../pages/LoginPage';
import SuperAdminPage from '../pages/SuperAdminPage';
import ProtectedRoute from './ProtectedRoute';
import ResetPasswordFirstLogin from '../pages/ResetPasswordFirstLogin';
import ResetChangePasswordPage from '../pages/ResetChangePasswordPage';
import PasswordResetPage from '../pages/PasswordResetPage';
import { UserRole } from '@tms/shared';
import EmployeePage from '../pages/EmployeePage';
import LandingPage from '../pages/LandingPage';
import SupervisorReportsPage from '../pages/SupervisorReportsPage';

const AppRoute: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/reports"
        element={
          <ProtectedRoute 
            requireAuth={true}
            allowedRoles={[UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin]}
            redirectPath="/login"
          >
            <SupervisorReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute 
            requireAuth={true}
            allowedRoles={[UserRole.Admin, UserRole.SupervisorAdmin]}
            redirectPath="/login"
          >
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute 
            requireAuth={true}
            allowedRoles={[UserRole.SuperAdmin]}
            redirectPath="/login"
          >
            <SuperAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee"
        element={
          <ProtectedRoute 
            requireAuth={true}
            allowedRoles={[UserRole.Emp, UserRole.Supervisor]}
            redirectPath="/login"
          >
            <EmployeePage />
          </ProtectedRoute>
        }
      />
      <Route path="/forgotpassword" element={<PasswordResetPage />} />
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
            requireAuth={true}
            allowedRoles={[UserRole.Admin, UserRole.SuperAdmin, UserRole.SupervisorAdmin, UserRole.Emp, UserRole.Supervisor]}
            redirectPath="/login"
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
      <Route path="/password/reset" element={<ResetChangePasswordPage />} />
    </Routes>
  );
};

export default AppRoute;
