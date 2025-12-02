import React from 'react';
import { Chip } from '@mui/material';
import { IStatusBadgeProps } from '../../../interfaces/dashboard';

const StatusBadge: React.FC<IStatusBadgeProps> = ({ status, text, ...props }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'success' as const, label: text || 'Active' };
      case 'inactive':
        return { color: 'default' as const, label: text || 'Inactive' };
      case 'pending':
        return { color: 'warning' as const, label: text || 'Pending' };
      case 'completed':
        return { color: 'success' as const, label: text || 'Completed' };
      case 'cancelled':
        return { color: 'error' as const, label: text || 'Cancelled' };
      case 'approved':
        return { color: 'success' as const, label: text || 'Approved' };
      case 'rejected':
        return { color: 'error' as const, label: text || 'Rejected' };
      default:
        return { color: 'default' as const, label: text || status };
    }
  };

  const { color, label } = getStatusConfig(status);

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      variant="filled"
      sx={{
        fontWeight: 'medium',
        borderRadius: 1.5,
      }}
      {...props}
    />
  );
};

export default StatusBadge;
