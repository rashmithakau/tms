import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast from '../molecules/Toast';

interface ToastMessage {
  id: string;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  autoHideDuration?: number;
  position?: 'top' | 'bottom';
}

interface ToastContextType {
  showToast: (message: string, severity?: 'success' | 'error' | 'warning' | 'info', title?: string, autoHideDuration?: number, position?: 'top' | 'bottom') => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'info',
    title?: string,
    autoHideDuration?: number,
    position: 'top' | 'bottom' = 'bottom'
  ) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = {
      id,
      message,
      severity,
      title,
      autoHideDuration,
      position,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (autoHideDuration) {
      setTimeout(() => {
        removeToast(id);
      }, autoHideDuration);
    }
  };

  const showSuccess = (message: string, title?: string) => {
    showToast(message, 'success', title, 4000);
  };

  const showError = (message: string, title?: string) => {
    showToast(message, 'error', title, 6000);
  };

  const showWarning = (message: string, title?: string) => {
    showToast(message, 'warning', title, 5000);
  };

  const showInfo = (message: string, title?: string) => {
    showToast(message, 'info', title, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  const handleClose = (id: string) => {
    removeToast(id);
  };

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          open={true}
          message={toast.message}
          severity={toast.severity}
          title={toast.title}
          autoHideDuration={toast.autoHideDuration}
          position={toast.position}
          onClose={() => handleClose(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};
