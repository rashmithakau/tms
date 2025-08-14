import React, { useState } from 'react';
import { AppBar, Toolbar, Divider, Box, Button, Popover } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import UserPopoverBox from './UserPopoverBox'; // Import the new component
import { logout } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

export default function CustomAppBar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const userName= localStorage.getItem('firstName');



  const navigate = useNavigate();

  const handleProfileClick = () => {
    // Handle profile click logic here
  };

  const handleLogoutClick = () => {
    logout();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('_id');
    navigate('/');
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
        paddingLeft: '60px',
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}></Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="text"
            endIcon={<KeyboardArrowDownIcon />}
            sx={{
              textTransform: 'none',
            }}
            onClick={handleClick}
          >
            Hi,&nbsp;{userName}
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
