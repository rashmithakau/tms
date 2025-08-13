import './app.css';
import theme from '../styles/theme';
import { ThemeProvider } from '@emotion/react';
import AdminPage from '../pages/AdminPage';


import LoginPage from '../pages/LoginPage';
import SuperAdminPage from '../pages/SuperAdminPage';


export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
       <SuperAdminPage/>
      </div>
    </ThemeProvider>
  );
}

