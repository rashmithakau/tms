import { TimesheetStatus } from '@tms/shared';

import mongoose, { Schema, Document } from "mongoose";

interface ITimesheetItem {
  work: string;
  projectId?: string;       
  hours: string[];
  descriptions: string[];
  dailyStatus: TimesheetStatus[]; // status for each day
}

interface ITimesheetCategory {
  category: string;      
  items: ITimesheetItem[];
}

export interface ITimesheet extends Document {
  userId: mongoose.Types.ObjectId;          
  weekStartDate: Date;    
  data: ITimesheetCategory[];
  status: TimesheetStatus; 
}

const TimesheetItemSchema = new Schema<ITimesheetItem>({
  work: { type: String, required: true },
  projectId: { type: String },
  hours: [{ type: String }],
  descriptions: [{ type: String }],
  dailyStatus: {
    type: [{ type: String, enum: Object.values(TimesheetStatus), default: TimesheetStatus.Draft }],
    default: Array(7).fill(TimesheetStatus.Draft)
  }
});

const TimesheetCategorySchema = new Schema<ITimesheetCategory>({
  category: { type: String, required: true },
  items: [TimesheetItemSchema],
});

const TimesheetSchema = new Schema<ITimesheet>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: Object.values(TimesheetStatus), default: TimesheetStatus.Draft },
  weekStartDate: { type: Date, required: true }, // store as ISO
  data: [TimesheetCategorySchema],
});

export const Timesheet = mongoose.model<ITimesheet>(
  "Timesheet",
  TimesheetSchema
);

