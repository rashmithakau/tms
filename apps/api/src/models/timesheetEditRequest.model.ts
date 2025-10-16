import mongoose, { Schema, Document } from 'mongoose';

export interface ITimesheetEditRequest {
  timesheetId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  requiredApprovals: mongoose.Types.ObjectId[];
  approvedBy: mongoose.Types.ObjectId[];
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITimesheetEditRequestDocument extends ITimesheetEditRequest, Document {
  _id: mongoose.Types.ObjectId;
}

const TimesheetEditRequestSchema = new Schema<ITimesheetEditRequestDocument>(
  {
    timesheetId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Timesheet', 
      required: true,
      index: true
    },
    employeeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    weekStartDate: { 
      type: Date, 
      required: true 
    },
    requiredApprovals: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    approvedBy: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    status: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected'], 
      default: 'Pending',
      index: true
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
TimesheetEditRequestSchema.index({ timesheetId: 1, status: 1 });
TimesheetEditRequestSchema.index({ requiredApprovals: 1, status: 1 });

const TimesheetEditRequestModel = mongoose.model<ITimesheetEditRequestDocument>(
  'TimesheetEditRequest',
  TimesheetEditRequestSchema,
  'timesheet_edit_requests'
);

export default TimesheetEditRequestModel;