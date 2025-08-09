import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';

interface CustomAppBarProps {
  open: boolean;
  height?: number; 
}

export default function CustomAppBar({height = 60 }: CustomAppBarProps) {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: 'none',
        border: 'none',
        height: `${height}px`,
        paddingLeft: '60px',
        alignContent: 'center',
      }}
    >
      <Toolbar></Toolbar>
    </AppBar>
  );
}
