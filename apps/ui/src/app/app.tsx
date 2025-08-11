import './app.css';
import theme from '../styles/theme';
import { ThemeProvider } from '@emotion/react';

import LoginPage from '../pages/LoginPage';
import CreateProject from '../components/organisms/CreateProject';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <CreateProject />
      </div>
    </ThemeProvider>
  );
}
