import { TimesheetStatus } from '@tms/shared';

export interface ITimeSheetRow {
  _id: string;
  date: string;
  projectId: string;
  projectName: string;
  task: string;
  billableType: 'Billable' | 'Non Billable';
  status: TimesheetStatus;
  dailyStatus?: TimesheetStatus[];
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
  };
}
