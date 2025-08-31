import { TimesheetStatus } from '@tms/shared';

export interface TimeSheetRow {
  _id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  projectId: string;
  projectName: string; // populated from project reference
  task: string;
  billableType: 'Billable' | 'Non Billable';
  status: TimesheetStatus;
  dailyStatus?: TimesheetStatus[]; // Array of 7 daily statuses
  description?: string;
  plannedHours?: number;
  hoursSpent?: number;
  employee?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber?: string;
    designation?: string;
  }; // populated for supervised timesheets
}


