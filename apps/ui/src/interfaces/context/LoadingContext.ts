import { ReactNode } from 'react';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  variant?: 'fullscreen' | 'inline' | 'overlay';
}

export interface LoadingContextType {
  loadingState: LoadingState;
  showLoading: (message?: string, variant?: 'fullscreen' | 'inline' | 'overlay') => void;
  hideLoading: () => void;
  setLoadingMessage: (message: string) => void;
}

export interface LoadingProviderProps {
  children: ReactNode;
}
