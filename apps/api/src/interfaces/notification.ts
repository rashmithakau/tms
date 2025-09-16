import mongoose, { Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId | string;
  type: 'TimesheetRejected' | 'TimesheetReminder' | 'ProjectAssignment' | 'TeamAssignment';
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  teamId?: string;
  teamName?: string;
  rejectedDates?: string[];
  reason?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface INotificationDocument extends mongoose.Document, INotification {}

export interface ICreateNotificationParams {
  userId: mongoose.Types.ObjectId | string;
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

export interface INotificationFilter {
  userId?: mongoose.Types.ObjectId | string;
  type?: string;
  isRead?: boolean;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}
