import mongoose from 'mongoose';
import { TimesheetStatus } from '@tms/shared';

export interface IDailyTimesheetInput {
  date?: string | Date;
  projectId?: string;
  projectName: string;
  teamId?: string;
  teamName?: string;
  taskTitle: string;
  description?: string;
  plannedHours?: number;
  hoursSpent: number;
  billableType: 'Billable' | 'Non-Billable';
}

export interface IDailyTimesheetUpdate {
  date?: string | Date;
  projectId?: string;
  projectName?: string;
  teamId?: string;
  teamName?: string;
  taskTitle?: string;
  description?: string;
  plannedHours?: number;
  hoursSpent?: number;
  billableType?: 'Billable' | 'Non-Billable';
  status?: TimesheetStatus;
  rejectionReason?: string;
}

export interface IListDailyTimesheetsParams {
  userId: string;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: TimesheetStatus;
  projectId?: string;
}

export interface ISubmitDailyTimesheetsParams {
  ids: string[];
}

export interface IBulkUpdateStatusParams {
  ids: string[];
  status: TimesheetStatus;
  rejectionReason?: string;
}
