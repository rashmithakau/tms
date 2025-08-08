import './app.css';
import LoginPage from '../pages/LoginPage';
import NavDrawer from '../components/organisms/NavDrawer';
import NumberField from '../components/atoms/inputFields/NumberField';
import BaseTextField from '../components/atoms/inputFields/BaseTextField';
import theme from '../styles/theme';
import { ThemeProvider } from '@emotion/react';
import SupeerAdminPage from '../pages/SuperAdminPage';

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <SupeerAdminPage />
      </div>
    </ThemeProvider>
  );
}

export default App;
