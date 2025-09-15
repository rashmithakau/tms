import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId | string;
  type: 'TimesheetRejected' | 'TimesheetReminder';
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  rejectedDates?: string[];
  reason?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['TimesheetRejected', 'TimesheetReminder'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    projectId: { type: String },
    projectName: { type: String },
    rejectedDates: [{ type: String }],
    reason: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
export default NotificationModel;



