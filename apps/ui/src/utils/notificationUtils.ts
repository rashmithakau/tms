import { NotificationType, UserRole } from '@tms/shared';
import { NavigateFunction } from 'react-router-dom';
import { Dispatch } from '@reduxjs/toolkit';
import {
  setWeekStartDate,
  setWeekEndDate,
  setReviewEmployeeId,
  setReviewWeekStartDate,
} from '../store/slices/timesheetSlice';
import { select_btn } from '../store/slices/dashboardNavSlice';

interface NotificationData {
  type: string;
  relatedUserId?: string;
  weekStartDate?: string;
  rejectedDates?: string[];
  message?: string;
  [key: string]: any;
}

export const getWeekStartFromDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00Z');
  const utcDay = date.getUTCDay();
  const diffToMonday = (utcDay + 6) % 7;
  const monday = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - diffToMonday,
      0,
      0,
      0,
      0
    )
  );
  return monday.toISOString().slice(0, 10);
};

export const extractWeekStartDate = (
  notification: NotificationData
): string | null => {
  if (notification.weekStartDate) {
    return notification.weekStartDate;
  }

  if (notification.rejectedDates && notification.rejectedDates.length > 0) {
    const firstRejectedDate = notification.rejectedDates[0];
    return getWeekStartFromDate(firstRejectedDate);
  }

  if (notification.message) {
    const dateMatch = notification.message.match(
      /week of (\w{3} \w{3} \d{1,2} \d{4})/
    );
    if (dateMatch && dateMatch[1]) {
      const parsedDate = new Date(dateMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
  }

  return null;
};


export const calculateWeekEndDate = (weekStart: string): string => {
  const startDate = new Date(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return endDate.toISOString().slice(0, 10);
};

export const dispatchWeekDates = (
  dispatch: Dispatch,
  weekStart: string
): void => {
  const weekEnd = calculateWeekEndDate(weekStart);
  dispatch(setWeekStartDate(weekStart));
  dispatch(setWeekEndDate(weekEnd));
};


export const getNavigationPathByRole = (userRole?: string): string => {
  if (userRole === UserRole.Admin || userRole === UserRole.SupervisorAdmin) {
    return '/admin';
  }
  return '/employee';
};

export const handleMyTimesheetsNavigation = (
  dispatch: Dispatch,
  navigate: NavigateFunction,
  navPath: string
): void => {
  dispatch(select_btn('My Timesheets'));
  navigate(navPath, {
    replace: window.location.pathname === navPath,
    state: { timestamp: Date.now() },
  });
};

export const handleReviewTimesheetsNavigation = (
  dispatch: Dispatch,
  navigate: NavigateFunction,
  navPath: string,
  relatedUserId?: string,
  weekStart?: string | null
): void => {
  if (relatedUserId) {
    dispatch(setReviewEmployeeId(relatedUserId));
  }

  if (weekStart) {
    dispatch(setReviewWeekStartDate(weekStart));
  }

  dispatch(select_btn('Review Timesheets'));

  if (relatedUserId) {
    navigate(`${navPath}?openEmployeeId=${relatedUserId}`);
  } else {
    navigate(navPath);
  }
};

export const handleNotificationNavigation = (
  notification: NotificationData,
  dispatch: Dispatch,
  navigate: NavigateFunction,
  userRole?: string
): void => {
  const weekStart = extractWeekStartDate(notification);

  if (weekStart) {
    dispatchWeekDates(dispatch, weekStart);
  }

  const navPath = getNavigationPathByRole(userRole);

  switch (notification.type) {
    case NotificationType.TimesheetRejected:
    case NotificationType.TimesheetReminder:
    case NotificationType.TimesheetApproved:
    case NotificationType.TimesheetEditApproved:
    case NotificationType.TimesheetEditRejected:
      handleMyTimesheetsNavigation(dispatch, navigate, navPath);
      break;

    case NotificationType.TimesheetEditRequest:
    case NotificationType.TimesheetSubmitted:
      handleReviewTimesheetsNavigation(
        dispatch,
        navigate,
        navPath,
        notification.relatedUserId,
        weekStart
      );
      break;

    case NotificationType.ProjectAssignment:
    case NotificationType.TeamAssignment:
      handleMyTimesheetsNavigation(dispatch, navigate, navPath);
      break;

    default:
      navigate(navPath);
      break;
  }
};

export const formatRelativeTime = (timestamp: number): string => {
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
