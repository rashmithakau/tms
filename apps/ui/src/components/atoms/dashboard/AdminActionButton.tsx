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
        py: 1.25,
        fontWeight: 'medium',
        alignItems: 'center',
        justifyContent: 'flex-start',
        '& .MuiButton-startIcon': {
          marginRight: 1,
          '& > *:nth-of-type(1)': {
            fontSize: 18
          }
        }
      }}
      {...props}
    >
      {label}
    </Button>
  );
};

export default AdminActionButton;
