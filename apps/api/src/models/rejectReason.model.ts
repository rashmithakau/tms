import mongoose, { Schema, Document } from 'mongoose';
import { IRejectReason, IRejectReasonDocument } from '../interfaces';

const RejectReasonSchema: Schema = new Schema({
  reason: { type: String, required: true },
  timesheet_id: { type: String, required: true },
  project_id: { type: String },
  team_id: { type: String },
  work_name: { type: String, required: true },
  rejected_days_indexes: { type: [Number], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IRejectReasonDocument>('RejectReason', RejectReasonSchema,"reject_reasons");
