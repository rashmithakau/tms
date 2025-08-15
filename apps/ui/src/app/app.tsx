import './app.css';
import theme from '../styles/theme';
import { ThemeProvider } from '@emotion/react';
import AppRoute from '../Routes/AppRoute';
import { ToastProvider } from '../components/contexts/ToastContext';
import { LoadingProvider } from '../components/contexts/LoadingContext';
import { AuthProvider } from '../components/contexts/AuthContext';
import GlobalLoading from '../components/organisms/GlobalLoading';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <LoadingProvider>
          <ToastProvider>
            <GlobalLoading />
            <AppRoute />
          </ToastProvider>
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
