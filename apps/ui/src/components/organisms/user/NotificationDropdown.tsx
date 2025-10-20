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
import { INotificationDropdownProps } from '../../../interfaces/organisms';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../../contexts/AuthContext';
import { handleNotificationNavigation, formatRelativeTime } from '../../../utils';

const NotificationDropdown: React.FC<INotificationDropdownProps> = ({
  iconButtonSx = {},
  popoverSx = {},
  dropdownWidth = 420,
  maxHeight = 500,
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAllRead, 
    setNotificationsFromServer 
  } = useSocket();
  const { authState } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    
    previousNotificationCount.current = currentNotificationCount;
    isInitialMount.current = false;
  }, [notifications.length]);

  const handleNotificationClick = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    
    
    try {
      const response = await listMyNotifications();
      const apiNotifications = (response.data?.notifications || []).map((n: any) => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        createdAt: new Date(n.createdAt).getTime(),
        read: n.isRead,
        projectName: n.projectName,
        projectId: n.projectId,
        rejectedDates: n.rejectedDates,
        reason: n.reason,
        relatedUserId: n.relatedUserId,
        weekStartDate: n.weekStartDate,
      }));
      setNotificationsFromServer(apiNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }

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

  const handleNotificationItemClick = (notification: any) => {
    handleClose();
    handleNotificationNavigation(notification, dispatch, navigate, user?.role);
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
                onClick={() => handleNotificationItemClick(notification)}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  borderRadius: 1,
                  mb: 0.5,
                  pb: 1.5,
                  cursor: 'pointer',
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
                        {formatRelativeTime(notification.createdAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5, pb: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        color="text.primary"
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.6,
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
