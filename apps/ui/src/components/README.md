# Reusable Components

This directory contains reusable components for loading states and toast notifications throughout the application.

## Loading Components

### PageLoading
A flexible loading component with multiple variants and sizes.

```tsx
import { PageLoading } from '../components';

// Fullscreen loading
<PageLoading 
  message="Loading..." 
  variant="fullscreen" 
  size="large" 
/>

// Inline loading
<PageLoading 
  message="Processing..." 
  variant="inline" 
  size="small" 
/>

// Overlay loading
<PageLoading 
  message="Saving..." 
  variant="overlay" 
  size="medium" 
/>
```

**Props:**
- `message`: Loading message text
- `size`: 'small' | 'medium' | 'large'
- `variant`: 'fullscreen' | 'inline' | 'overlay'
- `showMessage`: boolean to show/hide message

### GlobalLoading
Global loading component that works with LoadingContext.

```tsx
// Automatically shows when global loading state is active
<GlobalLoading />
```

## Toast Components

### Toast
Enhanced toast notification component.

```tsx
import { Toast } from '../components';

<Toast
  open={true}
  message="Operation completed successfully!"
  severity="success"
  title="Success"
  position="bottom"
  variant="filled"
/>
```

**Props:**
- `open`: boolean to show/hide toast
- `message`: toast message text
- `severity`: 'success' | 'error' | 'warning' | 'info'
- `title`: optional title for the toast
- `position`: 'top' | 'bottom'
- `variant`: 'filled' | 'outlined' | 'standard'
- `autoHideDuration`: auto-hide delay in milliseconds

## Context Hooks

### useToast
Hook for showing toast notifications.

```tsx
import { useToast } from '../components/contexts/ToastContext';

const { showSuccess, showError, showWarning, showInfo } = useToast();

// Show different types of toasts
showSuccess('Operation completed!', 'Success');
showError('Something went wrong!', 'Error');
showWarning('Please check your input', 'Warning');
showInfo('New update available', 'Info');
```

### useLoading
Hook for managing global loading states.

```tsx
import { useLoading } from '../components/contexts/LoadingContext';

const { showLoading, hideLoading, setLoadingMessage } = useLoading();

// Show loading with custom message
showLoading('Processing request...', 'overlay');

// Update loading message
setLoadingMessage('Almost done...');

// Hide loading
hideLoading();
```

## API Call Hook

### useApiCall
Combines API calls with loading states and toast notifications.

```tsx
import { useApiCall } from '../hooks/useApiCall';

const { execute, isLoading, error, resetError } = useApiCall({
  loadingMessage: 'Processing...',
  loadingVariant: 'overlay',
  successMessage: 'Operation completed successfully!',
  errorMessage: 'Operation failed!',
  onSuccess: (data) => console.log('Success:', data),
  onError: (error) => console.log('Error:', error),
});

// Execute API call
await execute(() => apiFunction());
```

**Options:**
- `loadingMessage`: message to show during loading
- `loadingVariant`: loading display variant
- `successMessage`: success toast message
- `errorMessage`: error toast message
- `showSuccessToast`: boolean to show success toast
- `showErrorToast`: boolean to show error toast
- `onSuccess`: callback for successful operations
- `onError`: callback for failed operations

## Usage Examples

### Basic Form Submission
```tsx
const { execute, isLoading } = useApiCall({
  loadingMessage: 'Submitting form...',
  successMessage: 'Form submitted successfully!',
  errorMessage: 'Failed to submit form',
});

const onSubmit = async (data) => {
  await execute(() => submitForm(data));
};
```

### Global Loading
```tsx
const { showLoading, hideLoading } = useLoading();

const handleOperation = async () => {
  showLoading('Processing...', 'fullscreen');
  try {
    await someAsyncOperation();
  } finally {
    hideLoading();
  }
};
```

### Toast Notifications
```tsx
const { showSuccess, showError } = useToast();

const handleSuccess = () => {
  showSuccess('Operation completed!', 'Success');
};

const handleError = () => {
  showError('Something went wrong!', 'Error');
};
```

## Setup

Make sure to wrap your app with the context providers:

```tsx
import { ToastProvider, LoadingProvider } from '../components/contexts';

function App() {
  return (
    <LoadingProvider>
      <ToastProvider>
        <GlobalLoading />
        {/* Your app content */}
      </ToastProvider>
    </LoadingProvider>
  );
}
```

## Demo Component

Use `ComponentDemo` to test all the features:

```tsx
import { ComponentDemo } from '../components';

// Add to any page to test the components
<ComponentDemo />
```
