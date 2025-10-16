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
import { NotificationType, UserRole } from '@tms/shared';
import { useAuth } from '../../../contexts/AuthContext';

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

  const getWeekStartFromDate = (dateString: string): string => {
    // Parse date in UTC to avoid timezone issues
    const date = new Date(dateString + 'T00:00:00Z');
    const utcDay = date.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Calculate days to subtract to get to Monday
    const diffToMonday = (utcDay + 6) % 7; // Sunday: 6, Monday: 0, Tuesday: 1, etc.
    const monday = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - diffToMonday,
      0, 0, 0, 0
    ));
    return monday.toISOString().slice(0, 10);
  };

  // Helper function to determine the correct navigation path based on user role
  const getNavigationPath = () => {
    const userRole = user?.role;
    if (userRole === UserRole.Admin || userRole === UserRole.SupervisorAdmin) {
      return '/admin';
    }
    return '/employee';
  };

  const handleNotificationItemClick = (notification: any) => {
    handleClose();

    console.log('🔔 Notification clicked:', notification.type);
    console.log('📅 Notification data:', notification);

    let weekStart: string | null = null;
    
    if (notification.weekStartDate) {
      weekStart = notification.weekStartDate;
      console.log('✅ Found weekStartDate in notification:', weekStart);
    } 
    else if (notification.rejectedDates && notification.rejectedDates.length > 0) {
      const firstRejectedDate = notification.rejectedDates[0];
      weekStart = getWeekStartFromDate(firstRejectedDate);
      console.log('✅ Calculated weekStart from rejectedDates:', weekStart);
    }
    else if (notification.message) {
      // Try to parse date from message for various notification types
      const dateMatch = notification.message.match(/week of (\w{3} \w{3} \d{1,2} \d{4})/);
      if (dateMatch && dateMatch[1]) {
        const parsedDate = new Date(dateMatch[1]);
        if (!isNaN(parsedDate.getTime())) {
          const year = parsedDate.getFullYear();
          const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const day = String(parsedDate.getDate()).padStart(2, '0');
          weekStart = `${year}-${month}-${day}`;
          console.log('✅ Parsed weekStart from message:', weekStart);
        }
      }
    }

    if (weekStart) {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      const weekEnd = endDate.toISOString().slice(0, 10);

      console.log('📆 Dispatching week range:', weekStart, 'to', weekEnd);
      dispatch(setWeekStartDate(weekStart));
      dispatch(setWeekEndDate(weekEnd));
    } else {
      console.warn('⚠️ No weekStart found for notification');
    }

    switch (notification.type) {
      case NotificationType.TimesheetRejected:
      case NotificationType.TimesheetReminder:
      case NotificationType.TimesheetEditApproved:
      case NotificationType.TimesheetEditRejected:
        dispatch(select_btn('My Timesheets'));
        // Navigate with state to force re-render even if already on page
        const navPath = getNavigationPath();
        navigate(navPath, { 
          replace: window.location.pathname === navPath,
          state: { timestamp: Date.now() }
        });
        break;
      
      case NotificationType.TimesheetEditRequest:
        // Navigate to Review Timesheets for supervisor to review the edit request
        console.log('👤 Review employee ID from notification:', notification.relatedUserId);
        console.log('📅 Review week start:', weekStart);
        
        // Set the employee ID and week for auto-opening the drawer
        if (notification.relatedUserId) {
          dispatch(setReviewEmployeeId(notification.relatedUserId));
          if (weekStart) {
            dispatch(setReviewWeekStartDate(weekStart));
          }
          dispatch(select_btn('Review Timesheets'));
          const navPath = getNavigationPath();
          navigate(`${navPath}?openEmployeeId=${notification.relatedUserId}`);
        } else {
          // For old notifications without relatedUserId, still set the week so the UI can filter
          console.warn('⚠️ Old notification without employee ID. Setting week filter to help find the request.');
          if (weekStart) {
            dispatch(setReviewWeekStartDate(weekStart));
          }
          dispatch(select_btn('Review Timesheets'));
          // Navigate without employee ID - user will need to manually find the employee
          const navPath = getNavigationPath();
          navigate(navPath);
        }
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
          const navPath = getNavigationPath();
          navigate(`${navPath}?openEmployeeId=${notification.relatedUserId}`);
        } else {
          if (weekStart) {
            dispatch(setReviewWeekStartDate(weekStart));
          }
          dispatch(select_btn('Review Timesheets'));
          const navPath = getNavigationPath();
          navigate(navPath);
        }
        break;
      
      case NotificationType.ProjectAssignment:
      case NotificationType.TeamAssignment:
        dispatch(select_btn('My Timesheets'));
        navigate(getNavigationPath());
        break;
      
      default:
        navigate(getNavigationPath());
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
