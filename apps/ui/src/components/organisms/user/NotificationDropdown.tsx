import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useSocket } from '../../../contexts/SocketContext';
import { listMyNotifications, markAllNotificationsRead } from '../../../api/notification';

interface NotificationDropdownProps {

  iconButtonSx?: object;
  popoverSx?: object;
  dropdownWidth?: number;
  maxHeight?: number;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  iconButtonSx = {},
  popoverSx = {},
  dropdownWidth = 360,
  maxHeight = 440,
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAllRead, 
    setNotificationsFromServer 
  } = useSocket();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const previousNotificationCount = useRef(notifications.length);
  const isInitialMount = useRef(true);

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => b.createdAt - a.createdAt);
  }, [notifications]);

  useEffect(() => {
    const currentNotificationCount = notifications.length;
    const hasNewNotification = currentNotificationCount > previousNotificationCount.current;
    
    if (hasNewNotification && !isInitialMount.current && !open && buttonRef.current) {
      setAnchorEl(buttonRef.current);
      
      // Auto-close after 5 seconds
      const autoCloseTimer = setTimeout(() => {
        setAnchorEl(null);
      }, 5000);
      
      // Cleanup timer if component unmounts or dropdown is manually closed
      return () => clearTimeout(autoCloseTimer);
    }
    
    previousNotificationCount.current = currentNotificationCount;
    isInitialMount.current = false;
  }, [notifications.length, open]);

  const handleNotificationClick = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    
    // Fetch notifications from server
    try {
      const response = await listMyNotifications();
      const apiNotifications = (response.data?.notifications || []).map((n: any) => ({
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
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }

    // Mark all as read on server
    try {
      await markAllNotificationsRead();
      markAllRead();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        sx={{
          '&:hover': {
            color: 'primary.main',
          },
          ...iconButtonSx,
        }}
        onClick={handleNotificationClick}
        aria-label="notifications"
      >
        <Badge 
          color="error" 
          badgeContent={unreadCount} 
          invisible={unreadCount === 0}
        >
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>

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
        PaperProps={{ 
          sx: { 
            width: dropdownWidth, 
            maxHeight: maxHeight, 
            p: 1,
            ...popoverSx,
          } 
        }}
      >
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          px: 1, 
          py: 0.5 
        }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications
          </Typography>
        </Box>
        
        <Divider />

        {/* Notification List */}
        {sortedNotifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ maxHeight: maxHeight - 100, overflow: 'auto' }}>
            {sortedNotifications.map((notification) => (
              <ListItem 
                key={notification.id} 
                alignItems="flex-start"
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      backgroundColor: notification.read ? 'grey.300' : 'primary.main',
                      color: notification.read ? 'text.secondary' : 'primary.contrastText',
                    }}
                  >
                    {(notification.title || 'N').charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography 
                        component="span" 
                        variant="body2" 
                        fontWeight={notification.read ? 400 : 600}
                        sx={{ flex: 1, mr: 1 }}
                      >
                        {notification.title || 'Notification'}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ flexShrink: 0 }}
                      >
                        {formatTime(notification.createdAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        color="text.primary"
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {notification.message}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default NotificationDropdown;
