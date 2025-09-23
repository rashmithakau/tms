import API from '../config/apiClient';

// Report filter interfaces
export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  employeeIds?: string[];
  submissionStatus?: string[];
  approvalStatus?: string[];
  projectIds?: string[];
  teamIds?: string[];
}

export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ReportMetadata {
  reportTypes: Array<{
    key: string;
    name: string;
    description: string;
  }>;
  formats: Array<{
    key: string;
    name: string;
    description: string;
  }>;
  statusOptions: Array<{
    key: string;
    name: string;
  }>;
}

// Preview response types
export interface SubmissionStatusPreviewRow {
  employeeName: string;
  employeeEmail: string;
  weekStartDate: string;
  submissionStatus: string;
  submissionDate?: string | null;
  daysLate?: number;
  totalHours: number;
}

export interface ApprovalStatusPreviewRow {
  employeeName: string;
  weekStartDate: string;
  submissionDate?: string | null;
  approvalStatus: string;
  approvalDate?: string | null;
  totalHours: number;
  rejectionReason?: string;
}

export interface DetailedTimesheetPreviewRow {
  employeeName: string;
  employeeEmail: string;
  weekStartDate: string;
  status: string;
  category: string;
  work: string;
  projectOrTeam: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
  total: string;
}

/**
 * Generate submission status report
 * @param filter Report filter parameters
 * @param format Report format ('pdf' or 'excel')
 * @returns Promise<Blob> - The report file as a blob for download
 */
export const generateSubmissionStatusReport = async (
  filter: ReportFilter,
  format: 'pdf' | 'excel' = 'excel'
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('format', format);

  if (filter.startDate) params.append('startDate', filter.startDate);
  if (filter.endDate) params.append('endDate', filter.endDate);
  if (filter.employeeIds?.length) {
    filter.employeeIds.forEach(id => params.append('employeeIds', id));
  }
  if (filter.submissionStatus?.length) {
    filter.submissionStatus.forEach(status => params.append('submissionStatus', status));
  }

  const response = await API.get(`/api/reports/submission-status?${params.toString()}`, {
    responseType: 'blob'
  });

  return response.data;
};

/**
 * Generate approval status report
 * @param filter Report filter parameters
 * @param format Report format ('pdf' or 'excel')
 * @returns Promise<Blob> - The report file as a blob for download
 */
export const generateApprovalStatusReport = async (
  filter: ReportFilter,
  format: 'pdf' | 'excel' = 'excel'
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('format', format);

  if (filter.startDate) params.append('startDate', filter.startDate);
  if (filter.endDate) params.append('endDate', filter.endDate);
  if (filter.employeeIds?.length) {
    filter.employeeIds.forEach(id => params.append('employeeIds', id));
  }
  if (filter.approvalStatus?.length) {
    filter.approvalStatus.forEach(status => params.append('approvalStatus', status));
  }

  const response = await API.get(`/api/reports/approval-status?${params.toString()}`, {
    responseType: 'blob'
  });

  return response.data;
};

/**
 * Generate detailed timesheet report
 * @param filter Report filter parameters
 * @param format Report format ('pdf' or 'excel')
 * @returns Promise<Blob> - The report file as a blob for download
 */
export const generateDetailedTimesheetReport = async (
  filter: ReportFilter,
  format: 'pdf' | 'excel' = 'excel'
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('format', format);

  if (filter.startDate) params.append('startDate', filter.startDate);
  if (filter.endDate) params.append('endDate', filter.endDate);
  if (filter.employeeIds?.length) {
    filter.employeeIds.forEach(id => params.append('employeeIds', id));
  }
  if (filter.approvalStatus?.length) {
    filter.approvalStatus.forEach(status => params.append('approvalStatus', status));
  }
  if (filter.projectIds?.length) {
    filter.projectIds.forEach(id => params.append('projectIds', id));
  }
  if (filter.teamIds?.length) {
    filter.teamIds.forEach(id => params.append('teamIds', id));
  }

  const response = await API.get(`/api/reports/detailed-timesheet?${params.toString()}`, {
    responseType: 'blob'
  });

  return response.data;
};

// Preview helpers (format=json)
const buildQueryParams = (filter: ReportFilter): URLSearchParams => {
  const params = new URLSearchParams();
  params.append('format', 'json');
  if (filter.startDate) params.append('startDate', filter.startDate);
  if (filter.endDate) params.append('endDate', filter.endDate);
  if (filter.employeeIds?.length) filter.employeeIds.forEach((id) => params.append('employeeIds', id));
  if (filter.submissionStatus?.length) filter.submissionStatus.forEach((s) => params.append('submissionStatus', s));
  if (filter.approvalStatus?.length) filter.approvalStatus.forEach((s) => params.append('approvalStatus', s));
  if (filter.projectIds?.length) filter.projectIds.forEach((id) => params.append('projectIds', id));
  if (filter.teamIds?.length) filter.teamIds.forEach((id) => params.append('teamIds', id));
  return params;
};

export const previewSubmissionStatus = async (filter: ReportFilter) => {
  const params = buildQueryParams(filter);
  const res = await API.get<{ data: SubmissionStatusPreviewRow[] }>(`/api/reports/submission-status?${params.toString()}`);
  return res.data.data;
};

export const previewApprovalStatus = async (filter: ReportFilter) => {
  const params = buildQueryParams(filter);
  const res = await API.get<{ data: ApprovalStatusPreviewRow[] }>(`/api/reports/approval-status?${params.toString()}`);
  return res.data.data;
};

export const previewDetailedTimesheet = async (filter: ReportFilter) => {
  const params = buildQueryParams(filter);
  const res = await API.get<{ data: any[] }>(`/api/reports/detailed-timesheet?${params.toString()}`);
  // Flatten categories/items into rows for table preview
  const rows: DetailedTimesheetPreviewRow[] = [];
  (res.data.data || []).forEach((t: any) => {
    (t.categories || []).forEach((c: any) => {
      (c.items || []).forEach((it: any) => {
        rows.push({
          employeeName: t.employeeName,
          employeeEmail: t.employeeEmail,
          weekStartDate: typeof t.weekStartDate === 'string' ? t.weekStartDate : new Date(t.weekStartDate).toISOString().slice(0, 10),
          status: t.status,
          category: c.category,
          work: it.work,
          projectOrTeam: it.projectName || it.teamName || 'N/A',
          mon: String(it.dailyHours?.[0] ?? ''),
          tue: String(it.dailyHours?.[1] ?? ''),
          wed: String(it.dailyHours?.[2] ?? ''),
          thu: String(it.dailyHours?.[3] ?? ''),
          fri: String(it.dailyHours?.[4] ?? ''),
          sat: String(it.dailyHours?.[5] ?? ''),
          sun: String(it.dailyHours?.[6] ?? ''),
          total: String(it.totalHours ?? ''),
        });
      });
    });
  });
  return rows;
};

/**
 * Get supervised employees for report filtering
 * @returns Promise with list of supervised employees
 */
export const getSupervisedEmployees = async () => {
  return API.get<{ employees: Employee[] }>('/api/reports/supervised-employees');
};

/**
 * Get report metadata including available report types, formats, and status options
 * @returns Promise with report metadata
 */
export const getReportMetadata = async () => {
  return API.get<ReportMetadata>('/api/reports/metadata');
};

/**
 * Download a blob as a file
 * @param blob The blob to download
 * @param filename The filename for the download
 */
export const downloadBlobAsFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Generate a filename based on report type and current date
 * @param reportType The type of report
 * @param format The file format
 * @returns A formatted filename
 */
export const generateReportFilename = (
  reportType: 'submission-status' | 'approval-status' | 'detailed-timesheet',
  format: 'pdf' | 'excel'
): string => {
  const date = new Date().toISOString().split('T')[0];
  const extension = format === 'pdf' ? 'pdf' : 'xlsx';
  return `${reportType}-report-${date}.${extension}`;
};