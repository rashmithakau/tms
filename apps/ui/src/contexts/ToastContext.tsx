import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
} from 'react';
import { Snackbar, Alert, AlertTitle, IconButton, Box } from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
 
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ToastVariant, ToastMessage, ToastApi } from '../interfaces';

const ToastContext = createContext<ToastApi | undefined>(undefined);

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    message: string,
    variant: ToastVariant = 'info',
    title?: string,
    autoHideDuration = 2500
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      id,
      message,
      variant,
      title,
      autoHideDuration,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const api = useMemo<ToastApi>(
    () => ({
      show: (
        message: string,
        variant: ToastVariant = 'info',
        title?: string,
        autoHideDuration?: number
      ) => {
        addToast(message, variant, title, autoHideDuration);
      },
      success: (message: string, title?: string) =>
        addToast(message, 'success', title),
      warning: (message: string, title?: string) =>
        addToast(message, 'warning', title),
      error: (message: string, title?: string) =>
        addToast(message, 'error', title),
      info: (message: string, title?: string) =>
        addToast(message, 'info', title),
      tip: (message: string, title?: string) => addToast(message, 'tip', title),
      close: (id: string) => removeToast(id),
    }),
    []
  );
  const theme = useTheme();
  const getToastStyles = (variant: ToastVariant) => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: theme.palette.background.default,
          Opacity: 10,
          borderColor: '#21bd26ff',
          color: theme.palette.text.primary,
          icon: <CheckIcon sx={{ color: '#21bd26ff' }} />,
        };
      case 'warning':
        return {
          backgroundColor: theme.palette.background.default,
          borderColor: '#ff9800',
          color: theme.palette.text.primary,
          icon: <WarningIcon sx={{ color: '#ff9800' }} />,
        };
      case 'error':
        return {
          backgroundColor: theme.palette.background.default,
          borderColor: '#f44336',
          color: theme.palette.text.primary,
          icon: <ErrorIcon sx={{ color: '#f44336' }} />,
        };
      default:
        return {
          backgroundColor: theme.palette.background.default,
          borderColor: '#2196f3',
          color: theme.palette.text.primary,
          icon: <InfoIcon sx={{ color: '#2196f3' }} />,
        };
    }
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toasts.map((toast) => {
        const styles = getToastStyles(toast.variant);
        return (
          <Snackbar
            key={toast.id}
            open={true}
            autoHideDuration={toast.autoHideDuration}
            onClose={() => removeToast(toast.id)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{ mt: 8 }}
          >
            <Alert
              severity={toast.variant === 'tip' ? 'info' : toast.variant}
              onClose={() => removeToast(toast.id)}
              icon={styles.icon}
              sx={{
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                minWidth: 250,
                border: styles.borderColor
                  ? `2px solid ${styles.borderColor}`
                  : undefined,
                '& .MuiAlert-icon': {
                  color: styles.color,
                },
                '& .MuiAlert-message': {
                  color: styles.color,
                },
                '& .MuiAlert-action': {
                  color: styles.color,
                },
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: 2,
              }}
              action={
                <IconButton
                  size="small"
                  onClick={() => removeToast(toast.id)}
                  sx={{ color: styles.color }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              <Box>
                {toast.title && (
                  <AlertTitle
                    sx={{ color: styles.color, fontWeight: 600, mb: 0.5 }}
                  >
                    {toast.title}
                  </AlertTitle>
                )}
                {toast.message}
              </Box>
            </Alert>
          </Snackbar>
        );
      })}
    </ToastContext.Provider>
  );
};

