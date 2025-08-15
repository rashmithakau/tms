import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, AlertTitle, Slide, SlideProps } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

interface ToastProps {
  open: boolean;
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  autoHideDuration?: number;
  onClose?: () => void;
  position?: 'top' | 'bottom';
  variant?: 'filled' | 'outlined' | 'standard';
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity = 'info',
  title,
  autoHideDuration = 6000,
  onClose,
  position = 'bottom',
  variant = 'filled',
}) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsOpen(false);
    onClose?.();
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'info':
        return '#2196f3';
      default:
        return '#2196f3';
    }
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{
        vertical: position === 'top' ? 'top' : 'bottom',
        horizontal: 'center',
      }}
      TransitionComponent={SlideTransition}
      sx={{
        '& .MuiSnackbarContent-root': {
          minWidth: '300px',
        },
      }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant={variant}
        sx={{
          width: '100%',
          '& .MuiAlert-icon': {
            fontSize: '24px',
          },
          '& .MuiAlert-message': {
            fontSize: '14px',
            lineHeight: '1.4',
          },
        }}
      >
        {title && (
          <AlertTitle sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {title}
          </AlertTitle>
        )}
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;

