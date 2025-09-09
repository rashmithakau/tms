import React from 'react';
import { Box, Alert } from '@mui/material';

interface ErrorAlertProps {
  error: string;
  onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <Box sx={{ m: 2 }}>
      <Alert severity="error" onClose={onClose}>
        {error}
      </Alert>
    </Box>
  );
};

export default ErrorAlert;


