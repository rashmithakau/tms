import { TimesheetStatus } from '@tms/shared';

export interface ITimesheetFormValues {
  date: string;
  projectId: string;
  taskTitle: string;
  description?: string;
  plannedHours?: string;
  hoursSpent?: string;
  billableType: 'Billable' | 'Non Billable';
  status: TimesheetStatus;
}

