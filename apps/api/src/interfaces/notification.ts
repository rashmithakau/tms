import mongoose, { Document } from 'mongoose';
import { NotificationType } from '@tms/shared';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  teamId?: string;
  teamName?: string;
  rejectedDates?: string[];
  reason?: string;
  isRead: boolean;
  relatedUserId?: string;
  weekStartDate?: string;
  createdAt: Date;
}

export interface INotificationDocument extends mongoose.Document, INotification {}

export interface ICreateNotificationParams {
  userId: mongoose.Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  teamId?: string;
  teamName?: string;
  rejectedDates?: string[];
  reason?: string;
  relatedUserId?: string;
  weekStartDate?: string;
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
