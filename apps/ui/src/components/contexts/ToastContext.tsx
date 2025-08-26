import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useSnackbar, VariantType, SnackbarKey, SnackbarProvider } from 'notistack';

type ToastVariant = Extract<VariantType, 'default' | 'success' | 'error' | 'warning' | 'info'>;

interface ToastApi {
  show: (message: string, options?: { variant?: ToastVariant; actionLabel?: string; onAction?: () => void; persist?: boolean }) => SnackbarKey;
  success: (message: string) => SnackbarKey;
  error: (message: string) => SnackbarKey;
  info: (message: string) => SnackbarKey;
  warning: (message: string) => SnackbarKey;
  close: (key?: SnackbarKey) => void;
}

const ToastContext = createContext<ToastApi | undefined>(undefined);

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use a child component to access notistack hook
  const InnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const api = useMemo<ToastApi>(() => ({
      show: (message, options) =>
        enqueueSnackbar(message, {
          variant: options?.variant ?? 'default',
          persist: options?.persist,
          action: options?.actionLabel
            ? (key) => (
                <button
                  onClick={() => {
                    options.onAction?.();
                    closeSnackbar(key);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {options.actionLabel}
                </button>
              )
            : undefined,
        }),
      success: (message) => enqueueSnackbar(message, { variant: 'success' }),
      error: (message) => enqueueSnackbar(message, { variant: 'error' }),
      info: (message) => enqueueSnackbar(message, { variant: 'info' }),
      warning: (message) => enqueueSnackbar(message, { variant: 'warning' }),
      close: (key) => closeSnackbar(key),
    }), [enqueueSnackbar, closeSnackbar]);

    return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
  };

  
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={1500}
      preventDuplicate
    >
      <InnerProvider>{children}</InnerProvider>
    </SnackbarProvider>
  );
};



