import CreateProject from '../components/organisms/CreateProject';
import LoginPage from '../pages/LoginPage';
import './app.css';
import theme from '../styles/theme';
import { ThemeProvider } from '@emotion/react';


export default function App() {
  return (

    <ThemeProvider theme={theme}>
      <div>

      </div>
    </ThemeProvider>
  );


}



export default App;
