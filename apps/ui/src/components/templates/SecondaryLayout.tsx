import Box from '@mui/material/Box';
import CustomAppBar from '../organisms/AppBar';
import { useTheme } from '@mui/material/styles';

interface SecondaryLayoutProps {
  children: React.ReactNode;
}

export default function SecondaryLayout({ children }: SecondaryLayoutProps) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CustomAppBar hasDrawer={false} />
      <Box
        sx={{
          flexGrow: 1,
          marginTop: '60px',
          backgroundColor: theme.palette.background.paper,
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
