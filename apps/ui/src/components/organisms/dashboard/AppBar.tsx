import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Divider,
  Box,
  Button,
  Popover,
  Typography,
  IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import UserPopoverBox from '../user/UserPopoverBox';
import EmpMenu from '../timesheet/EmpMenu';
import { useAuth } from '../../../contexts/AuthContext';
import logo from '../../../assets/images/WebSiteLogo.png';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import { useToast } from '../../../contexts/ToastContext';
import SearchBar from '../../atoms/common/inputField/SearchBar';
import NotificationDropdown from '../user/NotificationDropdown';
import ProfilePopup from '../popup/ProfilePopup';
import { useSelector, useDispatch } from 'react-redux';
import { EmpMenuItem } from '@tms/shared';
import { search_txt } from '../../../store/slices/SearchBarSlice';

export default function CustomAppBar({
  hasDrawer = true,
}: {
  hasDrawer?: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [empMenuAnchorEl, setEmpMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { authState, logout } = useAuth();
  const dispatch = useDispatch();
  
  const empSelectedMenu = useSelector((state: any) => state.empMenuNav.selectedBtn);
  const adminSelectedMenu = useSelector((state: any) => state.dashboardNav.selectedBtn);
  
  const shouldShowSearchBar = empSelectedMenu === EmpMenuItem.ReviewTimesheets || 
                              adminSelectedMenu === 'Review Timesheets' ||
                              adminSelectedMenu === 'Accounts';

  useEffect(() => {
    if (!shouldShowSearchBar) {
      dispatch(search_txt(''));
    }
  }, [shouldShowSearchBar, dispatch]);
  const { user } = authState;
  const toast = useToast();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEmpMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setEmpMenuAnchorEl(event.currentTarget);
  };

  const handleEmpMenuClose = () => {
    setEmpMenuAnchorEl(null);
  };

  const handleProfileClick = () => {
    setIsProfileOpen(true);
    handleClose();
  };

  const handleLogoutClick = async () => {
    try {
      await logout(); 
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Logout failed, but you will be redirected to login.');
      window.location.href = '/login';
    }
  };

  const open = Boolean(anchorEl);
  const empMenuOpen = Boolean(empMenuAnchorEl);
  const id = open ? 'simple-popover' : undefined;
  const empMenuId = empMenuOpen ? 'emp-menu-popover' : undefined;

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
          minHeight: '64px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
          {!hasDrawer && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handleEmpMenuClick}>
                <DensityMediumIcon />
              </IconButton>
              <img
                src={logo}
                alt="Logo"
                style={{
                  width: 47,
                  height: 47,
                }}
              />
              <Typography fontSize={25} sx={{ color: 'text.primary' }}>
                TimeSync
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {shouldShowSearchBar && (
            <Box sx={{ width: 400 }}>
              <SearchBar searchBy={
                adminSelectedMenu === 'Accounts' 
                  ? "Employee ID or Name" 
                  : "Employee Name"
              } />
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 200,
            justifyContent: 'flex-end',
          }}
        >
          <NotificationDropdown />
          <Button
            variant="text"
            endIcon={<KeyboardArrowDownIcon />}
            sx={{
              textTransform: 'none',
              marginLeft: '16px',
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
      <Popover
        id={empMenuId}
        open={empMenuOpen}
        anchorEl={empMenuAnchorEl}
        onClose={handleEmpMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <EmpMenu onClose={handleEmpMenuClose} />
      </Popover>

      <ProfilePopup
        open={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </AppBar>
  );
}
