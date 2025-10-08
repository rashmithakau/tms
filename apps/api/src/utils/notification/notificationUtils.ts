import NotificationModel from '../../models/notification.model';
import { socketService } from '../../config/socket';
import { NotificationType } from '@tms/shared';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  teamId?: string;
  teamName?: string;
  rejectedDates?: string[];
  reason?: string;
}

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

export const createTimesheetRejectionNotification = async (
  userId: string,
  projectName: string,
  rejectedDates: string[],
  reason?: string,
  projectId?: string
) => {
  return createAndEmitNotification({
    userId,
    type: NotificationType.TimesheetRejected,
    title: `Timesheet Rejected - ${projectName}`,
    message: `Timesheet rejected for ${rejectedDates.join(', ')}${reason ? ` - Reason: ${reason}` : ''}`,
    projectId,
    projectName,
    rejectedDates,
    reason,
  });
};


export const createTimesheetReminderNotification = async (
  userId: string,
  weekStartDate: Date,
  weekEndDate: Date
) => {
  return createAndEmitNotification({
    userId,
    type: NotificationType.TimesheetReminder,
    title: 'Timesheet Submission Reminder',
    message: `Please submit your timesheet for the week of ${weekStartDate.toDateString()} - ${weekEndDate.toDateString()}`,
  });
};

export const createTimesheetSubmittedNotification = async (
  supervisorId: string,
  employeeName: string,
  weekStartDate: Date,
  weekEndDate: Date
) => {
  return createAndEmitNotification({
    userId: supervisorId,
    type: NotificationType.TimesheetSubmitted,
    title: 'Timesheet Submitted',
    message: `${employeeName} has submitted their timesheet for the week of ${weekStartDate.toDateString()} - ${weekEndDate.toDateString()}`,
  });
};

export const createTimesheetEditRequestNotification = async (
  supervisorId: string,
  employeeName: string,
  weekStartDate: Date,
  weekEndDate: Date,
  timesheetId: string
) => {
  return createAndEmitNotification({
    userId: supervisorId,
    type: NotificationType.TimesheetEditRequest,
    title: 'Timesheet Edit Request',
    message: `${employeeName} has requested permission to edit their timesheet for the week of ${weekStartDate.toDateString()} - ${weekEndDate.toDateString()}`,
    projectId: timesheetId, // Using projectId field to store timesheetId for easy access
  });
};

export const createTimesheetEditApprovedNotification = async (
  employeeId: string,
  weekStartDate: Date,
  weekEndDate: Date
) => {
  return createAndEmitNotification({
    userId: employeeId,
    type: NotificationType.TimesheetEditApproved,
    title: 'Edit Request Approved',
    message: `Your edit request for the week of ${weekStartDate.toDateString()} - ${weekEndDate.toDateString()} has been approved. You can now edit your timesheet.`,
  });
};

export const createTimesheetEditRejectedNotification = async (
  employeeId: string,
  weekStartDate: Date,
  weekEndDate: Date
) => {
  return createAndEmitNotification({
    userId: employeeId,
    type: NotificationType.TimesheetEditRejected,
    title: 'Edit Request Rejected',
    message: `Your edit request for the week of ${weekStartDate.toDateString()} - ${weekEndDate.toDateString()} has been rejected.`,
  });
};

export const createBulkNotifications = async (notifications: NotificationData[]): Promise<void> => {
  const promises = notifications.map(notification => createAndEmitNotification(notification));
  await Promise.allSettled(promises);
};
