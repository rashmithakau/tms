import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import WindowLayout from '../../templates/layout/WindowLayout';
import HistoryTable from '../history/HistoryTable';
import { useHistory } from '../../../hooks/api/useHistory';

const SuperAdminHistoryWindow: React.FC = () => {
  const { history, loading, error } = useHistory();

  return (
    <WindowLayout
      titleBar={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="primary.main">
            System History
          </Typography>
        </Box>
      }
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <HistoryTable
          rows={history}
          loading={loading}
        />
      </Box>
    </WindowLayout>
  );
};

export default SuperAdminHistoryWindow;
