import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingState {
  isLoading: boolean;
  message?: string;
  variant?: 'fullscreen' | 'inline' | 'overlay';
}

interface LoadingContextType {
  loadingState: LoadingState;
  showLoading: (message?: string, variant?: 'fullscreen' | 'inline' | 'overlay') => void;
  hideLoading: () => void;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: 'Loading...',
    variant: 'fullscreen',
  });

  const showLoading = (message: string = 'Loading...', variant: 'fullscreen' | 'inline' | 'overlay' = 'fullscreen') => {
    setLoadingState({
      isLoading: true,
      message,
      variant,
    });
  };

  const hideLoading = () => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
    }));
  };

  const setLoadingMessage = (message: string) => {
    setLoadingState(prev => ({
      ...prev,
      message,
    }));
  };

  const value: LoadingContextType = {
    loadingState,
    showLoading,
    hideLoading,
    setLoadingMessage,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

