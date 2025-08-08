import './app.css';
import theme from '../styles/theme';
import { ThemeProvider } from '@emotion/react';


export function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>

      </div>
    </ThemeProvider>
  );


export default App;
