import { useState } from 'react';
import Box from '@mui/material/Box';
import CustomAppBar from '../organisms/AppBar';
import NavDrawer from '../organisms/NavDrawer';
import { useTheme } from '@mui/material/styles'; 

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const theme = useTheme(); 
 

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* <CssBaseline /> */}
      <CustomAppBar open={open} />
      <NavDrawer open={open} handleDrawer={handleDrawerOpen} />
      <Box
        sx={{
          flexGrow: 1, 
          marginTop: '60px', 
          marginBottom: '5px',
          marginRight: '5px',
          backgroundColor: theme.palette.background.default, 
          overflow: 'auto',
          borderRadius: '20px', 
        }}
      >
        {children}
      </Box>
    </Box>
  );
}