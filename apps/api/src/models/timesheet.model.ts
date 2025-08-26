import mongoose, { Schema, Document, Model } from 'mongoose';
import { TimesheetStatus } from '@tms/shared';

// --- Item Schema ---
const ItemSchema = new Schema(
  {
    work: { type: String, required: false }, // only for Absence
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false }, // only for Project
    hours: { type: [String], required: true }, // array of hours for 7 days
    descriptions: { type: [String], default: ['', '', '', '', '', '', ''] }, // array of descriptions for 7 days
  },
  { _id: false }
);

// --- Category Schema ---
const CategorySchema = new Schema(
  {
    category: { type: String, required: true }, // "Project" or "Absence"
    items: { type: [ItemSchema], required: true },
  },
  { _id: false }
);

// --- Timesheet Schema ---
export interface ITimesheet extends Document {
  userId: mongoose.Types.ObjectId;
  status: TimesheetStatus;
  weekStartDate: Date;
  categories: Array<{
    category: string;
    items: Array<{
      work?: string; // present if Absence
      projectId?: mongoose.Types.ObjectId; // present if Project
      hours: string[];
      descriptions: string[];
    }>;
  }>;
}

const TimesheetSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    weekStartDate: { type: Date, required: true },
    status: { type: String, enum: Object.values(TimesheetStatus), default: TimesheetStatus.Pending },
    categories: { type: [CategorySchema], required: true },
  },
  { timestamps: true }
);

const Timesheet: Model<ITimesheet> = mongoose.model<ITimesheet>(
  'Timesheet',
  TimesheetSchema
);

export default Timesheet;
