import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { AdminActionButton } from '../../atoms/dashboard';
import { IQuickActionsProps } from '../../../interfaces/dashboard';

const QuickActions: React.FC<IQuickActionsProps> = ({
  onAddUser,
  onAddProject,
  onViewReports
}) => {
  return (
    <Paper
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
        Quick Actions
      </Typography>
      
      <Box display="flex" flexDirection="column" gap={2} flex={1}>
        {onAddUser && (
          <AdminActionButton
            label="Add New User"
            icon={<Add />}
            onClick={onAddUser}
            variant="outlined"
            color="primary"
            fullWidth
          />
        )}
        
        {onAddProject && (
          <AdminActionButton
            label="Create Project"
            icon={<Add />}
            onClick={onAddProject}
            variant="outlined"
            color="primary"
            fullWidth
          />
        )}
        
        {onViewReports && (
          <AdminActionButton
            label="View Reports"
            icon={<Visibility />}
            onClick={onViewReports}
            variant="outlined"
            color="info"
            fullWidth
          />
        )}
      </Box>
    </Paper>
  );
};

export default QuickActions;
