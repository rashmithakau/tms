import { TimesheetStatus } from '@tms/shared';
import mongoose, { Schema, Document } from "mongoose";

export interface IDailyTimesheet extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  projectId?: mongoose.Types.ObjectId;
  projectName: string;
  teamId?: mongoose.Types.ObjectId;
  teamName?: string;
  taskTitle: string;
  description?: string;
  plannedHours?: number;
  hoursSpent: number;
  billableType: 'Billable' | 'Non-Billable';
  status: TimesheetStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyTimesheetSchema = new Schema<IDailyTimesheet>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  date: { 
    type: Date, 
    required: true, 
    index: true 
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project',
    index: true 
  },
  projectName: { 
    type: String, 
    required: true 
  },
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team' 
  },
  teamName: { 
    type: String 
  },
  taskTitle: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  plannedHours: { 
    type: Number, 
    default: 0 
  },
  hoursSpent: { 
    type: Number, 
    required: true,
    min: 0,
    max: 24 
  },
  billableType: { 
    type: String, 
    enum: ['Billable', 'Non-Billable'], 
    required: true,
    default: 'Billable'
  },
  status: { 
    type: String, 
    enum: Object.values(TimesheetStatus), 
    default: TimesheetStatus.Draft,
    index: true 
  },
  rejectionReason: { 
    type: String 
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
DailyTimesheetSchema.index({ userId: 1, date: -1 });
DailyTimesheetSchema.index({ userId: 1, status: 1 });
DailyTimesheetSchema.index({ projectId: 1, date: -1 });

export const DailyTimesheet = mongoose.model<IDailyTimesheet>(
  "DailyTimesheet",
  DailyTimesheetSchema
);
