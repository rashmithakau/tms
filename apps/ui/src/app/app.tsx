import './app.css';
import theme from '../styles/theme';
import { ThemeProvider } from '@emotion/react';
import AdminPage from '../pages/AdminPage';
import { Login } from '@mui/icons-material';
import LoginPage from '../pages/LoginPage'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        {/* <AdminPage/> */}
        <LoginPage/>
      </div>
    </ThemeProvider>
  );
}

