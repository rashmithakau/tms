import React, { useState } from 'react';
import { AppBar, Toolbar, Divider, Box, Button, Popover, Typography, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import UserPopoverBox from './UserPopoverBox'; // Import the new component
import { logout } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../../assets/images/WebSiteLogo.png';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';

export default function CustomAppBar({hasDrawer = true}: { hasDrawer?: boolean }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { authState, logout: authLogout } = useAuth();
  const { user } = authState;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();

  const handleProfileClick = () => {
    // Handle profile click logic here
  };

  const handleLogoutClick = async () => {
    try {
      // Call the API logout
      await logout();
      // Use the auth context to handle logout
      authLogout();
      // Navigate to login page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state and redirect
      authLogout();
      navigate('/', { replace: true });
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#fff',
        boxShadow: 'none',
        border: 'none',
        height: '64px',
        paddingLeft: hasDrawer ? '60px' : '0px',
        alignContent: 'center',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', color:'red[100]'}}>

        { !hasDrawer && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap:2}}>
                  <IconButton><DensityMediumIcon/></IconButton>
                <img
                    src={logo}
                    alt="Logo"
                    style={{
                      width: 47,
                      height: 47,
                    }}
                  />
                  {<Typography fontSize={25} sx={{ color: 'text.primary'}}>TimeSync</Typography>}
                </Box>
        )}

        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="text"
            endIcon={<KeyboardArrowDownIcon />}
            sx={{
              textTransform: 'none',
            }}
            onClick={handleClick}
          >
            Hi,&nbsp;{user?.firstName || 'User'}
          </Button>
        </Box>
      </Toolbar>
      <Divider />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <UserPopoverBox
          onProfileClick={handleProfileClick}
          onLogoutClick={handleLogoutClick}
        />
      </Popover>
    </AppBar>
  );
}
