import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { AdminActionButton } from '../../atoms/dashboard';
import { IQuickActionsProps } from '../../../interfaces/dashboard';

const QuickActions: React.FC<IQuickActionsProps> = ({
  onAddUser,
  onAddProject,
  onViewReports,
  addUserButtonLabel = 'Admin'
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
      <Typography 
        variant="h6" 
        component="h3" 
        gutterBottom 
        fontWeight="bold"
        textAlign="center"
      >
        Quick Actions
      </Typography>
      
      <Box display="flex" flexDirection="column" gap={2} flex={1}>
        {onAddUser && (
          <AdminActionButton
            label={addUserButtonLabel}
            icon={<Add fontSize="small" />}
            onClick={onAddUser}
            variant="outlined"
            color="primary"
            fullWidth
          />
        )}
        
        {onAddProject && (
          <AdminActionButton
            label="Create Project"
            icon={<Add fontSize="small" />}
            onClick={onAddProject}
            variant="outlined"
            color="primary"
            fullWidth
          />
        )}
        
        {onViewReports && (
          <AdminActionButton
            label="View Reports"
            icon={<Visibility fontSize="small" />}
            onClick={onViewReports}
            variant="outlined"
            color="primary"
            fullWidth
          />
        )}
      </Box>
    </Paper>
  );
};

export default QuickActions;
