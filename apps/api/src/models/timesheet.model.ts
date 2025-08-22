import mongoose, { Model } from 'mongoose';
import { TimesheetStatus } from '@tms/shared';

export type BillableType = 'Billable' | 'Non Billable';

export interface TimesheetDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  projectId: mongoose.Types.ObjectId;
  taskTitle: string;
  description: string;
  plannedHours: number; // hours as decimal
  hoursSpent: number; // hours as decimal
  billableType: BillableType;
  status: TimesheetStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface TimesheetModel extends Model<TimesheetDocument> {
  findByUser(userId: string): Promise<TimesheetDocument[]>;
}

const timesheetSchema = new mongoose.Schema<TimesheetDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    taskTitle: { type: String, required: true },
    description: { type: String, default: '' },
    plannedHours: { type: Number, default: 0 },
    hoursSpent: { type: Number, default: 0 },
    billableType: { type: String, enum: ['Billable', 'Non Billable'], required: true },
    status: { type: String, enum: Object.values(TimesheetStatus), default: TimesheetStatus.Draft },
  },
  {
    timestamps: true,
  }
);

timesheetSchema.statics.findByUser = function (userId: string) {
  return this.find({ userId }).populate('projectId', 'projectName').sort({ date: -1, createdAt: -1 });
};

const Timesheet = mongoose.model<TimesheetDocument, TimesheetModel>('Timesheet', timesheetSchema);

export default Timesheet;



