import React from 'react';
import { Button } from '@mui/material';
import { IAdminActionButtonProps } from '../../../interfaces/dashboard';

const AdminActionButton: React.FC<IAdminActionButtonProps> = ({
  label,
  icon,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  ...props
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      startIcon={icon}
      sx={{
        textTransform: 'none',
        borderRadius: 2,
        px: 3,
        py: 1,
        fontWeight: 'medium',
      }}
      {...props}
    >
      {label}
    </Button>
  );
};

export default AdminActionButton;
