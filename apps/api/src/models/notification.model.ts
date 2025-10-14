import mongoose, { Schema, Document } from 'mongoose';
import { INotification, INotificationDocument } from '../interfaces';
import { NotificationType } from '@tms/shared';

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    projectId: { type: String },
    projectName: { type: String },
    rejectedDates: [{ type: String }],
    reason: { type: String },
    isRead: { type: Boolean, default: false },
    relatedUserId: { type: String },
    weekStartDate: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const NotificationModel = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
export default NotificationModel;



