import { useCallback, useState } from 'react';
import { useLoading } from '../../contexts/LoadingContext';
import { useToast } from '../../contexts/ToastContext';
import { UseApiCallOptions, UseApiCallReturn } from '../../interfaces';

export const useApiCall = (options: UseApiCallOptions = {}): UseApiCallReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

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

    
      hideLoading();
      setIsLoading(false);

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      
      if (onSuccess) {
        
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
      if (showErrorToast && errorMsg) {
        toast.error(errorMsg);
      }

      if (onError) {
        onError(err);
      }

  
      hideLoading();
      setIsLoading(false);

      throw err;
    }
  };

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    resetError,
  };
};
