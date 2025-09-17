import { useState } from 'react';
import Box from '@mui/material/Box';
import CustomAppBar from '../../organisms/dashboard/AppBar';
import NavDrawer from '../../organisms/dashboard/NavDrawer';
import { useTheme } from '@mui/material/styles'; 
import INavItemProps  from '../../../interfaces/INavItemProps';

interface MainLayoutProps {
  children: React.ReactNode;
  items: INavItemProps[][];
}

export default function MainLayout({ children,items}: MainLayoutProps) {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = (isOpen: boolean) => {
    setOpen(isOpen);
  };


  const theme = useTheme(); 
 

  return (
    <Box sx={{ display: 'flex', height: '100vh'}}>
      {/* <CssBaseline /> */}
      <CustomAppBar/>
      <NavDrawer open={open} handleDrawer={handleDrawerOpen} items={items}/>
      <Box
        sx={{
          flexGrow: 1, 
          marginTop: '60px',
          backgroundColor: theme.palette.background.paper, 
          overflow: 'auto'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}