import API from '../config/apiClient';
import { TimesheetStatus } from '@tms/shared';

export interface DailyTimesheetEntry {
  _id?: string;
  date?: string;
  projectId?: string;
  projectName: string;
  teamId?: string;
  teamName?: string;
  taskTitle: string;
  description?: string;
  plannedHours?: number;
  hoursSpent: number;
  billableType: 'Billable' | 'Non-Billable';
  status?: TimesheetStatus;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListDailyTimesheetsParams {
  startDate?: string;
  endDate?: string;
  status?: TimesheetStatus;
  projectId?: string;
}

export const createDailyTimesheet = async (data: Omit<DailyTimesheetEntry, '_id' | 'status' | 'createdAt' | 'updatedAt'>) => {
  return API.post<{ timesheet: DailyTimesheetEntry }>('/api/daily-timesheets', data);
};

export const listMyDailyTimesheets = async (params?: ListDailyTimesheetsParams) => {
  return API.get<{ timesheets: DailyTimesheetEntry[] }>('/api/daily-timesheets', { params });
};

export const getDailyTimesheet = async (id: string) => {
  return API.get<{ timesheet: DailyTimesheetEntry }>(`/api/daily-timesheets/${id}`);
};

export const updateDailyTimesheet = async (id: string, data: Partial<DailyTimesheetEntry>) => {
  return API.patch<{ timesheet: DailyTimesheetEntry }>(`/api/daily-timesheets/${id}`, data);
};

export const deleteDailyTimesheet = async (id: string) => {
  return API.delete(`/api/daily-timesheets/${id}`);
};

export const submitDailyTimesheets = async (ids: string[]) => {
  return API.post('/api/daily-timesheets/submit', { ids });
};

export const listSupervisedDailyTimesheets = async () => {
  return API.get<{ timesheets: DailyTimesheetEntry[] }>('/api/daily-timesheets/supervised/list');
};

export const bulkUpdateDailyTimesheetStatus = async (
  ids: string[],
  status: TimesheetStatus.Approved | TimesheetStatus.Rejected,
  rejectionReason?: string
) => {
  return API.post('/api/daily-timesheets/supervised/update-status', { ids, status, rejectionReason });
};
