import './app.css';
import theme from '../styles/theme';
import { ThemeProvider } from '@emotion/react';

import AdminPage from '../pages/AdminPage';
import LoginPage from '../pages/LoginPage';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
       <LoginPage />
      </div>
    </ThemeProvider>
  );
}

