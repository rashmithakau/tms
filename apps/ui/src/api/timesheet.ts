// services/timesheet.service.ts
import API from '../config/apiClient';
import { TimesheetStatus, BillableType } from '@tms/shared';

// --- TypeScript types for weekly timesheets ---
export type TimesheetItem = {
  work?: string; // only for Absence
  projectId?: string; // only for Project
  hours: string[]; // 7 days
  descriptions: string[]; // 7 days
};



export type TimesheetCategory = {
  category: 'Project' | 'Absence';
  items: TimesheetItem[];
};

export type Timesheet = {
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
  categories: TimesheetCategory[];
  status: TimesheetStatus;
  createdAt: string;
  updatedAt: string;
};

// --- API calls ---
export const listMyTimesheets = async () => {
  return API.get<Timesheet[]>('/api/timesheets');
};

export const listSupervisedTimesheets = async () => {
  return API.get<Timesheet[]>('/api/timesheets/supervised');
};

export type CreateTimesheetPayload = {
  weekStartDate: string | Date;
  categories: TimesheetCategory[];
};

export const createMyTimesheet = async (data: CreateTimesheetPayload) => {
  return API.post<Timesheet>('/api/timesheets', data);
};

export const updateMyTimesheet = async (id: string, data: Partial<CreateTimesheetPayload & { status?: TimesheetStatus }>) => {
  return API.patch<Timesheet>(`/api/timesheets/${id}`, data);
};

export const deleteMyTimesheet = async (id: string) => {
  return API.delete(`/api/timesheets/${id}`);
};

export const submitMyDraftTimesheets = async (ids: string[]) => {
  return API.post('/api/timesheets/submit', { ids });
};

export const updateSupervisedTimesheetsStatusApi = async (
  ids: string[],
  status: TimesheetStatus.Approved | TimesheetStatus.Rejected
) => {
  return API.post('/api/timesheets/supervised/status', { ids, status });
};
