export type ToastVariant = 'success' | 'warning' | 'error' | 'info' | 'tip';

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
  title?: string;
  autoHideDuration?: number;
}

export interface ToastApi {
  show: (
    message: string,
    variant?: ToastVariant,
    title?: string,
    autoHideDuration?: number
  ) => void;
  success: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  tip: (message: string, title?: string) => void;
  close: (id: string) => void;
}
