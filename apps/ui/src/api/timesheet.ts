import API from '../config/apiClient';
import { TimesheetStatus } from '@tms/shared';

export type Timesheet = {
  _id: string;
  date: string;
  projectName: string;
  taskTitle: string;
  description?: string;
  plannedHours?: number;
  hoursSpent?: number;
  billableType: 'Billable' | 'Non Billable';
  status: TimesheetStatus;
};

export const listMyTimesheets = async () => {
  return API.get('/api/timesheets');
};

export const createMyTimesheet = async (data: Omit<Timesheet, '_id'>) => {
  return API.post('/api/timesheets', data);
};

export const updateMyTimesheet = async (id: string, data: Partial<Timesheet>) => {
  return API.patch(`/api/timesheets/${id}`, data);
};

export const deleteMyTimesheet = async (id: string) => {
  return API.delete(`/api/timesheets/${id}`);
};

export const submitMyDraftTimesheets = async (ids: string[]) => {
  return API.post('/api/timesheets/submit', { ids });
};



