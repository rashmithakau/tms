import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';
import LoginPage from '../pages/LoginPage';
import SuperAdminPage from '../pages/SuperAdminPage';
import ProtectedRoute from './ProtectedRoute';
import ResetPasswordFirstLogin from '../pages/ResetPasswordFirstLogin';
import { Box } from '@mui/material';

const AppRoute: React.FC = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
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
        path="/change-password"
        element={
          <ProtectedRoute
            isAllowed={
              (isAuthenticated && userRole === 'admin'||
              userRole === 'superadmin' ||
              userRole === 'emp'||
              userRole === 'supervisor' 
            )
            }
            redirectPath="/"
          >
            <ResetPasswordFirstLogin />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoute;
