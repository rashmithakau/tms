import API from '../config/apiClient';
import { ReportFilter, Employee, SubmissionStatusPreviewRow, ApprovalStatusPreviewRow } from '../interfaces/api';
import { ReportMetadata } from '@tms/shared';
import { buildQueryParams, transformDetailedTimesheetData } from '../utils';

export const generateSubmissionStatusReport = async (
  filter: ReportFilter,
  format: 'pdf' | 'excel' = 'excel'
): Promise<Blob> => {
  const params = buildQueryParams(filter);
  params.set('format', format);

  const response = await API.get(`/api/reports/submission-status?${params.toString()}`, {
    responseType: 'blob'
  });

  return response.data;
};
export const generateApprovalStatusReport = async (
  filter: ReportFilter,
  format: 'pdf' | 'excel' = 'excel'
): Promise<Blob> => {
  const params = buildQueryParams(filter);
  params.set('format', format);

  const response = await API.get(`/api/reports/approval-status?${params.toString()}`, {
    responseType: 'blob'
  });

  return response.data;
};

export const generateDetailedTimesheetReport = async (
  filter: ReportFilter,
  format: 'pdf' | 'excel' = 'excel'
): Promise<Blob> => {
  const params = buildQueryParams(filter);
  params.set('format', format);

  const response = await API.get(`/api/reports/detailed-timesheet?${params.toString()}`, {
    responseType: 'blob'
  });

  return response.data;
};


export const previewSubmissionStatus = async (filter: ReportFilter) => {
  const params = buildQueryParams(filter);
  params.set('format', 'json');
  const res = await API.get<{ data: SubmissionStatusPreviewRow[] }>(`/api/reports/submission-status?${params.toString()}`);
  return res.data.data;
};


export const previewApprovalStatus = async (filter: ReportFilter) => {
  const params = buildQueryParams(filter);
  params.set('format', 'json');
  const res = await API.get<{ data: ApprovalStatusPreviewRow[] }>(`/api/reports/approval-status?${params.toString()}`);
  return res.data.data;
};


export const previewDetailedTimesheet = async (filter: ReportFilter) => {
  const params = buildQueryParams(filter);
  params.set('format', 'json');
  const res = await API.get<{ data: any[] }>(`/api/reports/detailed-timesheet?${params.toString()}`);
  return transformDetailedTimesheetData(res.data.data);
};


// removed previewRejectedTimesheets API as feature is not supported


export const getSupervisedEmployees = async () => {
  return API.get<{ employees: Employee[] }>('/api/reports/supervised-employees');
};


export const getReportMetadata = async () => {
  return API.get<ReportMetadata>('/api/reports/metadata');
};




