import React from 'react';
import { Container, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { Home } from '@mui/icons-material';
import { IAdminDashboardLayoutProps } from '../../../interfaces/dashboard';

const AdminDashboardLayout: React.FC<IAdminDashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  headerActions
}) => {
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary">Admin</Typography>
      </Breadcrumbs>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {headerActions && (
          <Box display="flex" gap={2} alignItems="center">
            {headerActions}
          </Box>
        )}
      </Box>

      <Box>{children}</Box>
    </Container>
  );
};

export default AdminDashboardLayout;
