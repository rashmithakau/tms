import mongoose, { Document } from 'mongoose';
import { TimesheetStatus } from '@tms/shared';

export interface ITimesheetItem {
  work?: string;
  projectId?: string;
  teamId?: string;
  hours: string[];
  descriptions: string[];
  dailyStatus: TimesheetStatus[];
}

export interface ITimesheetItemInput {
  work?: string;
  projectId?: string;
  teamId?: string;
  hours: string[];
  descriptions: string[];
  dailyStatus?: TimesheetStatus[];
}

export interface ITimesheetCategory {
  category: string;
  items: ITimesheetItem[];
}

export interface ITimesheetCategoryInput {
  category: string;
  items: ITimesheetItemInput[];
}

export interface ITimesheet extends Document {
  userId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  data: ITimesheetCategory[];
  status: TimesheetStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimesheetDocument extends mongoose.Document, ITimesheet {}

export interface ICreateTimesheetParams {
  userId: string;
  weekStartDate: string | Date;
  data: ITimesheetCategoryInput[];
}

export interface IUpdateTimesheetParams {
  weekStartDate?: string | Date;
  data?: ITimesheetCategoryInput[];
  status?: TimesheetStatus;
  rejectionReason?: string;
}

export interface ITimesheetSubmissionParams {
  ids: string[];
}

export interface IDailyStatusUpdateParams {
  timesheetId: string;
  categoryIndex: number;
  itemIndex: number;
  dayIndices: number[];
  status: TimesheetStatus.Approved | TimesheetStatus.Rejected;
  rejectionReason?: string;
}

export interface IBatchDailyStatusUpdateParams {
  updates: IDailyStatusUpdateParams[];
}

export interface UpdateTimesheetParams {
  weekStartDate?: string | Date;
  data?: ITimesheetCategoryInput[];
  status?: TimesheetStatus;
  rejectionReason?: string;
}