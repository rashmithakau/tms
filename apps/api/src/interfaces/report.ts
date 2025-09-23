import { TimesheetStatus } from '@tms/shared';

export interface ISubmissionStatusReport {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  weekStartDate: Date | string;
  submissionStatus: 'Submitted' | 'Late' | 'Missing';
  submissionDate?: Date | string | null;
  daysLate?: number;
  totalHours: number;
}

export interface IApprovalStatusReport {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  weekStartDate: Date | string;
  timesheetId: string;
  submissionDate?: Date | string | null;
  approvalStatus: TimesheetStatus;
  approvalDate?: Date | string | null;
  rejectionReason?: string;
  totalHours: number;
}

export interface ITimesheetReportDataItem {
  work: string;
  projectId?: string;
  projectName?: string;
  teamId?: string;
  teamName?: string;
  dailyHours: Array<string | number>;
  dailyDescriptions: Array<string>;
  dailyStatus: TimesheetStatus[];
  totalHours: number;
}

export interface ITimesheetReportCategory {
  category: string;
  items: ITimesheetReportDataItem[];
}

export interface ITimesheetReportData {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  weekStartDate: Date | string;
  timesheetId: string;
  status: TimesheetStatus;
  submissionDate?: Date | string | null;
  approvalDate?: Date | string | null;
  rejectionReason?: string;
  totalHours: number;
  categories: ITimesheetReportCategory[];
}

export interface IReportFilter {
  startDate?: Date | string;
  endDate?: Date | string;
  employeeIds?: string[];
  projectIds?: string[];
  teamIds?: string[];
  approvalStatus?: TimesheetStatus[];
  submissionStatus?: TimesheetStatus[];
}

export enum ReportType {
  SUBMISSION_STATUS = 'submission-status',
  APPROVAL_STATUS = 'approval-status',
  DETAILED_TIMESHEET = 'detailed-timesheet'
}

export enum ReportFormat {
  EXCEL = 'excel',
  PDF = 'pdf'
}



