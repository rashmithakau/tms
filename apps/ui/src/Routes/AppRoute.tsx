import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AdminPage from '../pages/AdminPage';

import LoginPage from '../pages/LoginPage';
import SuperAdminPage from '../pages/SuperAdminPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoute: React.FC = () => {
  //  get auth and role from localStorage
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
            isAllowed={isAuthenticated && userRole === 'superadmin'}
            redirectPath="/"
          >
            <SuperAdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoute;
