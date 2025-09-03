import mongoose, { Schema, Document } from 'mongoose';

export interface IRejectReason extends Document {
  reason: string;
  timesheet_id: string;
  project_id: string;
  rejected_days_indexes: number[];
  createdAt: Date;
}

const RejectReasonSchema: Schema = new Schema({
  reason: { type: String, required: true },
  timesheet_id: { type: String, required: true },
  project_id: { type: String, required: true },
  rejected_days_indexes: { type: [Number], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IRejectReason>('RejectReason', RejectReasonSchema);
