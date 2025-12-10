import API from '../config/apiClient';
import { TimesheetStatus } from '@tms/shared';
import { Timesheet, CreateTimesheetPayload } from '../interfaces/api/ITimesheet';

export const listMyTimesheets = async () => {
  return API.get<{ timesheets: Timesheet[] }>('/timesheets');
};

export const listSupervisedTimesheets = async () => {
  return API.get<{ timesheets: Timesheet[] }>('/timesheets/supervised');
};

export const getSupervisedProjects = async () => {
  return API.get<{ projects: Array<{ _id: string; projectName: string }> }>('/project/supervised');
};

export const getSupervisedTeams = async () => {
  return API.get<{ teams: Array<{ _id: string; teamName: string }> }>('/team/supervised');
};

export const createMyTimesheet = async (data: CreateTimesheetPayload) => {
  return API.post<Timesheet>('/timesheets', data);
};

export const updateMyTimesheet = async (id: string, data: Partial<CreateTimesheetPayload & { status?: TimesheetStatus }>) => {
  return API.patch<Timesheet>(`/api/timesheets/${id}`, data);
};

export const deleteMyTimesheet = async (id: string) => {
  return API.delete(`/api/timesheets/${id}`);
};

export const submitMyDraftTimesheets = async (ids: string[]) => {
  return API.post('/timesheets/submit', { ids });
};

export const updateSupervisedTimesheetsStatusApi = async (
  ids: string[],
  status: TimesheetStatus.Approved | TimesheetStatus.Rejected
) => {
  return API.post('/timesheets/supervised/status', { ids, status });
};

export const getOrCreateMyTimesheetForWeek = async (weekStartDateIso?: string) => {
  const params = weekStartDateIso ? { params: { weekStartDate: weekStartDateIso } } : undefined;
  return API.get<{ timesheet?: Timesheet; timesheetId?: string; timesheets?: Timesheet[] }>('/timesheets/week', params as any);
};

export const updateDailyTimesheetStatusApi = async ({
  timesheetId,
  categoryIndex,
  itemIndex,
  dayIndices,
  status,
  rejectionReason
}: {
  timesheetId: string;
  categoryIndex: number;
  itemIndex: number;
  dayIndices: number[];
  status: TimesheetStatus.Approved | TimesheetStatus.Rejected;
  rejectionReason?: string;
}) => {
  return API.post('/timesheets/supervised/daily-status', {
    timesheetId,
    categoryIndex,
    itemIndex,
    dayIndices,
    status,
    rejectionReason
  });
};

export const batchUpdateDailyTimesheetStatusApi = async (updates: Array<{
  timesheetId: string;
  categoryIndex: number;
  itemIndex: number;
  dayIndices: number[];
  status: TimesheetStatus.Approved | TimesheetStatus.Rejected;
  rejectionReason?: string;
}>) => {
  return API.post('/timesheets/supervised/daily-status-batch', { updates });
};

export const requestTimesheetEdit = async (timesheetId: string) => {
  return API.post('/timesheets/request-edit', { timesheetId });
};

export const approveTimesheetEditRequest = async (timesheetId: string) => {
  return API.post('/timesheets/approve-edit-request', { timesheetId });
};

export const rejectTimesheetEditRequest = async (timesheetId: string) => {
  return API.post('/timesheets/reject-edit-request', { timesheetId });
};

export const getPendingEditRequests = async () => {
  return API.get<{ editRequests: any[] }>('/timesheets/pending-edit-requests');
};

