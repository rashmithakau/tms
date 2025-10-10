import mongoose, { Schema, Document } from 'mongoose';

export interface ITimesheetEditRequest extends Document {
  timesheetId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  requiredApprovals: mongoose.Types.ObjectId[]; // Array of supervisor IDs who need to approve
  approvedBy: mongoose.Types.ObjectId[]; // Array of supervisor IDs who have approved
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const TimesheetEditRequestSchema = new Schema<ITimesheetEditRequest>(
  {
    timesheetId: { type: Schema.Types.ObjectId, ref: 'Timesheet', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    weekStartDate: { type: Date, required: true },
    requiredApprovals: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    approvedBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  },
  { 
    timestamps: true,
    collection: 'timesheet_edit_requests'
  }
);

const TimesheetEditRequestModel = mongoose.model<ITimesheetEditRequest>(
  'TimesheetEditRequest',
  TimesheetEditRequestSchema
);

export default TimesheetEditRequestModel;
