import './app.css';
import theme from '../styles/theme';
import { ThemeProvider } from '@emotion/react';

import { Routes, Route } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';
import LoginPage from '../pages/LoginPage';
import SuperAdminPage from '../pages/SuperAdminPage';
import ProtectedRoute from './ProtectedRoute';


export default function App() {
  // Example: get auth and role from localStorage
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAllowed={isAuthenticated && userRole === 'admin'} redirectPath="/">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute isAllowed={isAuthenticated && userRole === 'superadmin'} redirectPath="/">
                <SuperAdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

