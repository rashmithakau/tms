import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import WindowLayout from '../../templates/layout/WindowLayout';
import HistoryTable from '../history/HistoryTable';
import HistoryFilter from '../../molecules/history/HistoryFilter';
import { useHistory } from '../../../hooks/api/useHistory';

const AdminHistoryWindow: React.FC = () => {
  const { history, loading, error, applyFilters } = useHistory();

  return (
    <WindowLayout
      titleBar={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="primary.main">
            History
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <HistoryFilter 
            onFilterChange={applyFilters}
            showUserFilter={true}
          />
        </Box>

        <HistoryTable
          rows={history}
          loading={loading}
        />
      </Box>
    </WindowLayout>
  );
};

export default AdminHistoryWindow;
