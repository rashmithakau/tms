import React from 'react';
import { Box, Typography, Toolbar, IconButton, Tooltip } from '@mui/material';
import { Refresh, Download, Settings } from '@mui/icons-material';
import { AdminActionButton } from '../../atoms/dashboard';
import { IAdminToolbarProps } from '../../../interfaces/dashboard';

const AdminToolbar: React.FC<IAdminToolbarProps> = ({
  title,
  onRefresh,
  onExport,
  onSettings,
  actions = []
}) => {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        mb: 2,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        sx={{ flex: '1 1 100%' }}
        variant="h6"
        component="div"
        fontWeight="bold"
      >
        {title}
      </Typography>

      <Box display="flex" alignItems="center" gap={1}>
        {actions.map((action, index) => (
          <AdminActionButton
            key={index}
            label={action.label}
            icon={action.icon}
            onClick={action.onClick}
            variant={action.variant || 'outlined'}
            color={action.color || 'primary'}
            size="small"
          />
        ))}

        {onRefresh && (
          <Tooltip title="Refresh">
            <IconButton onClick={onRefresh} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        )}

        {onExport && (
          <Tooltip title="Export">
            <IconButton onClick={onExport} size="small">
              <Download />
            </IconButton>
          </Tooltip>
        )}

        {onSettings && (
          <Tooltip title="Settings">
            <IconButton onClick={onSettings} size="small">
              <Settings />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Toolbar>
  );
};

export default AdminToolbar;
