import NotificationModel from '../models/notification.model';
import { socketService } from '../config/socket';

export interface NotificationData {
  userId: string;
  type: 'TimesheetRejected' | 'TimesheetReminder' | 'ProjectAssignment' | 'TeamAssignment';
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  teamId?: string;
  teamName?: string;
  rejectedDates?: string[];
  reason?: string;
}

/**
 * Creates a notification and emits it via socket
 */
export const createAndEmitNotification = async (data: NotificationData) => {
  try {
    const notification = await NotificationModel.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      projectId: data.projectId,
      projectName: data.projectName,
      teamId: data.teamId,
      teamName: data.teamName,
      rejectedDates: data.rejectedDates,
      reason: data.reason,
      isRead: false,
    });

    // Emit socket notification
    await socketService.emitToUser(data.userId, 'notification', {
      _id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      projectId: notification.projectId,
      projectName: notification.projectName,
      teamId: notification.teamId,
      teamName: notification.teamName,
      rejectedDates: notification.rejectedDates,
      reason: notification.reason,
      createdAt: notification.createdAt,
      isRead: notification.isRead,
    });

    return notification;
  } catch (error) {
    console.error('Failed to create/emit notification:', error);
    throw error;
  }
};

/**
 * Creates a timesheet rejection notification
 */
export const createTimesheetRejectionNotification = async (
  userId: string,
  projectName: string,
  rejectedDates: string[],
  reason?: string,
  projectId?: string
) => {
  return createAndEmitNotification({
    userId,
    type: 'TimesheetRejected',
    title: `Timesheet Rejected - ${projectName}`,
    message: `Timesheet rejected for ${rejectedDates.join(', ')}${reason ? ` - Reason: ${reason}` : ''}`,
    projectId,
    projectName,
    rejectedDates,
    reason,
  });
};

/**
 * Creates a timesheet reminder notification
 */
export const createTimesheetReminderNotification = async (
  userId: string,
  weekStartDate: Date,
  weekEndDate: Date
) => {
  return createAndEmitNotification({
    userId,
    type: 'TimesheetReminder',
    title: 'Timesheet Submission Reminder',
    message: `Please submit your timesheet for the week of ${weekStartDate.toDateString()} - ${weekEndDate.toDateString()}`,
  });
};

/**
 * Bulk creates notifications for multiple users
 */
export const createBulkNotifications = async (notifications: NotificationData[]): Promise<void> => {
  const promises = notifications.map(notification => createAndEmitNotification(notification));
  await Promise.allSettled(promises);
};
