import { createTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
const fonts = {
  primary: 'Lora',
};
const theme = createTheme({
  palette: {
    primary: {
      main: '#013282', 
    },
    secondary: {
      main: grey[300], 
    },
    background: {
      default: '#ffffff',
      paper: '#EBEFF4', 
    },
  },
  typography: {
    fontFamily: fonts.primary,
    h1: { fontFamily: fonts.primary },
    h2: { fontFamily: fonts.primary },
    h3: { fontFamily: fonts.primary },
    h4: { fontFamily: fonts.primary },
    button: { fontFamily: fonts.primary },
   
  },
});

export default theme;