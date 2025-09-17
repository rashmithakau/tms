import { TimesheetStatus } from '@tms/shared';

export interface TimesheetItem {
  work?: string; 
  projectId?: string; 
  teamId?: string;
  hours: string[]; //
  descriptions: string[]; 
}

export interface TimesheetCategory {
  category: 'Project' | 'Team' | 'Absence';
  items: TimesheetItem[];
}

export interface Timesheet {
  _id: string;
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber?: string;
    designation?: string;
  };
  weekStartDate: string;
  data: TimesheetCategory[]; 
  categories: TimesheetCategory[]; 
  status: TimesheetStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimesheetPayload {
  weekStartDate: string | Date;
  data: TimesheetCategory[];
}
