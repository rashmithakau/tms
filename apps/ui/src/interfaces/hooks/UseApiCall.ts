export interface UseApiCallOptions {
  loadingMessage?: string;
  loadingVariant?: 'fullscreen' | 'inline' | 'overlay';
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  onSuccess?: (data: any) => void | Promise<void>;
  onError?: (error: any) => void;
}

export interface UseApiCallReturn {
  execute: (apiCall: () => Promise<any>) => Promise<any>;
  isLoading: boolean;
  error: any;
  resetError: () => void;
}
