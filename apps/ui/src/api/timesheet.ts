// services/timesheet.service.ts
import API from '../config/apiClient';
import { TimesheetStatus } from '@tms/shared';

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
  weekEndDate: string;
  categories: TimesheetCategory[];
  status: TimesheetStatus;
  totalHours: number;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type TimesheetStats = {
  stats: Array<{
    _id: TimesheetStatus;
    count: number;
    totalHours: number;
  }>;
  totalTimesheets: number;
  totalHours: number;
};

// --- API calls ---
export const listMyTimesheets = async () => {
  return API.get<{ timesheets: Timesheet[] }>('/api/timesheets');
};

export const listSupervisedTimesheets = async (params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.startDate) searchParams.append('startDate', params.startDate);
  if (params?.endDate) searchParams.append('endDate', params.endDate);
  if (params?.employeeId) searchParams.append('employeeId', params.employeeId);
  
  const url = `/api/timesheets/supervised${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  return API.get<{ timesheets: Timesheet[] }>(url);
};

export type CreateTimesheetPayload = {
  weekStartDate: string | Date;
  data: TimesheetCategory[];
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

export const getOrCreateMyTimesheetForWeek = async (weekStartDateIso?: string) => {
  const params = weekStartDateIso ? { params: { weekStartDate: weekStartDateIso } } : undefined;
  return API.get<{ timesheet?: Timesheet; timesheetId?: string; timesheets?: Timesheet[] }>('/api/timesheets/week', params as any);
};

export const getTimesheetStats = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.append('startDate', params.startDate);
  if (params?.endDate) searchParams.append('endDate', params.endDate);
  
  const url = `/api/timesheets/stats${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  return API.get<TimesheetStats>(url);
};

export const bulkUpdateTimesheet = async (timesheetId: string, data: TimesheetCategory[]) => {
  return API.put<{ timesheet: Timesheet }>('/api/timesheets/bulk-update', {
    timesheetId,
    data
  });
};
