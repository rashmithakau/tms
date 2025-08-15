import { useState } from 'react';
import { useToast } from '../components/contexts/ToastContext';
import { useLoading } from '../components/contexts/LoadingContext';

interface UseApiCallOptions {
  loadingMessage?: string;
  loadingVariant?: 'fullscreen' | 'inline' | 'overlay';
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  onSuccess?: (data: any) => void | Promise<void>;
  onError?: (error: any) => void;
}

interface UseApiCallReturn {
  execute: (apiCall: () => Promise<any>) => Promise<any>;
  isLoading: boolean;
  error: any;
  resetError: () => void;
}

export const useApiCall = (options: UseApiCallOptions = {}): UseApiCallReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { showSuccess, showError } = useToast();
  const { showLoading, hideLoading } = useLoading();

  const {
    loadingMessage = 'Loading...',
    loadingVariant = 'overlay',
    successMessage,
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true,
    onSuccess,
    onError,
  } = options;

  const execute = async (apiCall: () => Promise<any>) => {
    try {
      setIsLoading(true);
      setError(null);
      showLoading(loadingMessage, loadingVariant);

      const result = await apiCall();

      // Hide loading first
      hideLoading();
      setIsLoading(false);

      // Show success toast if configured
      if (showSuccessToast && successMessage) {
        showSuccess(successMessage);
      }

      // Execute onSuccess callback asynchronously to ensure proper timing
      if (onSuccess) {
        // Use setTimeout to ensure the callback runs after the current execution context
        setTimeout(async () => {
          try {
            await onSuccess(result);
          } catch (callbackError) {
            console.error('Error in onSuccess callback:', callbackError);
          }
        }, 0);
      }

      return result;
    } catch (err: any) {
      const errorMsg = errorMessage || err.response?.data?.message || 'An error occurred';
      setError(err);

      if (showErrorToast) {
        showError(errorMsg, 'Error');
      }

      if (onError) {
        onError(err);
      }

      // Ensure loading is hidden on error
      hideLoading();
      setIsLoading(false);

      throw err;
    }
  };

  const resetError = () => {
    setError(null);
  };

  return {
    execute,
    isLoading,
    error,
    resetError,
  };
};
