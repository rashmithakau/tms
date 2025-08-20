import { TimesheetStatus } from '@tms/shared';

export interface TimeSheetRow {
  _id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  project: string;
  task: string;
  billableType: 'Billable' | 'Non Billable';
  status: TimesheetStatus;
  description?: string;
  plannedHours?: number;
  hoursSpent?: number;
}


