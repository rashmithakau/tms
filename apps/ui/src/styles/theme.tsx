import { createTheme } from '@mui/material';
const fonts = {
  primary: 'Lora',
};
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0B0B45' },
    secondary: { main: '#1000FF' },
    background: { default: '#EBEFF4', paper: '#FDFDFF' },
    text: { primary: '#2C2C2C', secondary: '#9A9A9A' },
    divider: '#E5E7EB',
    success: { main: '#10B981' },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
  
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