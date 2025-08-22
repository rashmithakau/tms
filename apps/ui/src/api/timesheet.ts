import API from '../config/apiClient';
import { TimesheetStatus } from '@tms/shared';

export type Timesheet = {
  _id: string;
  date: string;
  projectId: string;
  projectName: string; // populated from project reference
  taskTitle: string;
  description?: string;
  plannedHours?: number;
  hoursSpent?: number;
  billableType: 'Billable' | 'Non Billable';
  status: TimesheetStatus;
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber?: string;
    designation?: string;
  }; // populated for supervised timesheets
};

export const listMyTimesheets = async () => {
  return API.get('/api/timesheets');
};

export const listSupervisedTimesheets = async () => {
  return API.get('/api/timesheets/supervised');
};

export const createMyTimesheet = async (data: Omit<Timesheet, '_id' | 'projectName' | 'userId'>) => {
  return API.post('/api/timesheets', data);
};

export const updateMyTimesheet = async (id: string, data: Partial<Omit<Timesheet, '_id' | 'projectName' | 'userId'>>) => {
  return API.patch(`/api/timesheets/${id}`, data);
};

export const deleteMyTimesheet = async (id: string) => {
  return API.delete(`/api/timesheets/${id}`);
};

export const submitMyDraftTimesheets = async (ids: string[]) => {
  return API.post('/api/timesheets/submit', { ids });
};

export const updateSupervisedTimesheetsStatusApi = async (ids: string[], status: TimesheetStatus.Approved | TimesheetStatus.Rejected) => {
  return API.post('/api/timesheets/supervised/status', { ids, status });
};



