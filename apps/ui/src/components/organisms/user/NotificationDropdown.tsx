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
import { setWeekStartDate, setWeekEndDate, setReviewEmployeeId, setReviewWeekStartDate } from '../../../store/slices/timesheetSlice';
import { select_btn } from '../../../store/slices/dashboardNavSlice';
import { NotificationType } from '@tms/shared';

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

  const getWeekStartFromDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().slice(0, 10);
  };

  const handleNotificationItemClick = (notification: any) => {
    handleClose();

    let weekStart: string | null = null;
    
    if (notification.weekStartDate) {
      weekStart = notification.weekStartDate;
    } 
    else if (notification.rejectedDates && notification.rejectedDates.length > 0) {
      const firstRejectedDate = notification.rejectedDates[0];
      weekStart = getWeekStartFromDate(firstRejectedDate);
    }
    else if (notification.message && notification.type === NotificationType.TimesheetSubmitted) {
      const dateMatch = notification.message.match(/week of (\w{3} \w{3} \d{1,2} \d{4})/);
      if (dateMatch && dateMatch[1]) {
        const parsedDate = new Date(dateMatch[1]);
        if (!isNaN(parsedDate.getTime())) {
          const year = parsedDate.getFullYear();
          const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const day = String(parsedDate.getDate()).padStart(2, '0');
          weekStart = `${year}-${month}-${day}`;
        }
      }
    }

    if (weekStart) {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      const weekEnd = endDate.toISOString().slice(0, 10);

      dispatch(setWeekStartDate(weekStart));
      dispatch(setWeekEndDate(weekEnd));
    }

    switch (notification.type) {
      case NotificationType.TimesheetRejected:
      case NotificationType.TimesheetReminder:
      case NotificationType.TimesheetEditRequest:
      case NotificationType.TimesheetEditApproved:
      case NotificationType.TimesheetEditRejected:
        dispatch(select_btn('My Timesheets'));
        navigate('/employee');
        break;
      
      case NotificationType.TimesheetSubmitted:
        // Navigate to Review Timesheets for supervisor notifications
        console.log('👤 Review employee ID from notification:', notification.relatedUserId);
        console.log('� Review week start:', weekStart);
        
        // Check if we have the necessary data
        if (!notification.relatedUserId) {
          console.warn('⚠️ This notification was created before the employee ID tracking feature was added.');
          console.warn('⚠️ The drawer will not auto-open. Please manually find the employee.');
          console.warn('💡 Tip: New notifications will have this feature.');
        }
        
        // Set the employee ID and week for auto-opening the drawer
        if (notification.relatedUserId) {
          dispatch(setReviewEmployeeId(notification.relatedUserId));
          if (weekStart) {
            dispatch(setReviewWeekStartDate(weekStart));
          }
          dispatch(select_btn('Review Timesheets'));
          navigate(`/employee?openEmployeeId=${notification.relatedUserId}`);
        } else {
          if (weekStart) {
            dispatch(setReviewWeekStartDate(weekStart));
          }
          dispatch(select_btn('Review Timesheets'));
          navigate('/employee');
        }
        break;
      
      case NotificationType.ProjectAssignment:
      case NotificationType.TeamAssignment:
        dispatch(select_btn('My Timesheets'));
        navigate('/employee');
        break;
      
      default:
        navigate('/employee');
        break;
    }
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
                        {formatTime(notification.createdAt)}
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
