import React, { useMemo, useState } from 'react';
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
import UserPopoverBox from './UserPopoverBox';
import EmpMenu from './EmpMenu';
import { logout } from '../../api/auth';
import { useAuth } from '../contexts/AuthContext';
import logo from '../../assets/images/WebSiteLogo.png';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import { useToast } from '../contexts/ToastContext';
import SearchBar from '../atoms/inputFields/SearchBar';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Badge, List, ListItem, ListItemText, ListItemAvatar, Avatar, Stack } from '@mui/material';
import { useSocket } from '../contexts/SocketContext';
import { listMyNotifications, markAllNotificationsRead } from '../../api/notification';
import ProfilePopup from './ProfilePopup';

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
  const { authState, logout: authLogout } = useAuth();
  const { user } = authState;
  const toast = useToast();
  const { notifications, unreadCount, markAllRead, clearNotifications, setNotificationsFromServer } = useSocket();
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

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
      authLogout();
      toast.success('Logged out successfully');
      window.location.reload();
    } catch (error) {
      authLogout();
      toast.error('Logout failed on server. You have been signed out locally.');
      window.location.reload();
    }
  };

  const open = Boolean(anchorEl);
  const empMenuOpen = Boolean(empMenuAnchorEl);
  const notifOpen = Boolean(notifAnchorEl);
  const id = open ? 'simple-popover' : undefined;
  const empMenuId = empMenuOpen ? 'emp-menu-popover' : undefined;
  const notifId = notifOpen ? 'notif-popover' : undefined;

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => b.createdAt - a.createdAt);
  }, [notifications]);

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
          <Box sx={{ width: 400 }}>
            <SearchBar />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 200,
            justifyContent: 'flex-end',
          }}
        >
          <IconButton
            sx={{
              '&:hover': {
                color: 'primary.main',
              },
            }}
            onClick={async (e) => {
              setNotifAnchorEl(e.currentTarget);
              try {
                const resp = await listMyNotifications();
                const apiNotifications = (resp.data?.notifications || []).map((n: any) => ({
                  id: n._id,
                  title: n.title,
                  message: n.message,
                  createdAt: new Date(n.createdAt).getTime(),
                  read: n.isRead,
                  projectName: n.projectName,
                  projectId: n.projectId,
                  rejectedDates: n.rejectedDates,
                  reason: n.reason,
                }));
                setNotificationsFromServer(apiNotifications);
              } catch {}
              try { await markAllNotificationsRead(); markAllRead(); } catch {}
            }}
          >
            <Badge color="error" badgeContent={unreadCount} invisible={unreadCount === 0}>
              <NotificationsOutlinedIcon />
            </Badge>
          </IconButton>
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
        id={notifId}
        open={notifOpen}
        anchorEl={notifAnchorEl}
        onClose={() => setNotifAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{ sx: { width: 360, maxHeight: 440, p: 1 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.5 }}>
          <Typography variant="subtitle1">Notifications</Typography>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" title="Mark all read" onClick={markAllRead}>
              <MarkEmailReadOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" title="Clear" onClick={clearNotifications}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
        <Divider />
        {sortedNotifications.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List dense>
            {sortedNotifications.map((n) => (
              <ListItem key={n.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ width: 28, height: 28 }}>{(n.title || 'N').charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={<Typography component="span" variant="body2" fontWeight={600}>{n.title || 'Notification'}</Typography>}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">{n.message}</Typography>
                      {n.projectName && (
                        <Typography component="span" variant="caption" color="text.secondary"> Project: {n.projectName}</Typography>
                      )}
                      {n.rejectedDates && n.rejectedDates.length > 0 && (
                        <Typography component="span" variant="caption" color="text.secondary"> Dates: {n.rejectedDates.join(', ')}</Typography>
                      )}
                      {n.reason && (
                        <Typography component="span" variant="caption" color="text.secondary"> Reason: {n.reason}</Typography>
                      )}
                      <Typography component="span" variant="caption" color="text.secondary"> {new Date(n.createdAt).toLocaleString()}</Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>

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

      <ProfilePopup open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </AppBar>
  );
}
