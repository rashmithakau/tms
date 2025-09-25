import { ReportMetadata } from '@tms/shared';

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
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
  total: string;
}
