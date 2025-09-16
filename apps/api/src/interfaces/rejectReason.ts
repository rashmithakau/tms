import mongoose, { Document } from 'mongoose';

export interface IRejectReason extends Document {
  reason: string;
  timesheet_id: string;
  project_id?: string;
  team_id?: string;
  work_name: string;
  rejected_days_indexes: number[];
  createdAt: Date;
}

export interface IRejectReasonDocument extends mongoose.Document, IRejectReason {}

export interface ICreateRejectReasonParams {
  reason: string;
  timesheet_id: string;
  project_id?: string;
  team_id?: string;
  work_name: string;
  rejected_days_indexes: number[];
}

export interface IRejectReasonFilter {
  timesheet_id?: string;
  project_id?: string;
  team_id?: string;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}
