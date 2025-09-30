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



export interface IDetailedTimesheetReport {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  weekStartDate: string;
  status: string;
  categories: Array<{
    category: string;
    items: Array<{
      work: string;
      projectName?: string;
      teamName?: string;
      dailyHours: number[];
      totalHours: number;
    }>;
  }>;
  totalHours: number;
}

export interface ProfessionalPDFConfig {
  // Company branding
  company: {
    name: string;
    address?: string;
    logo?: string;
    website?: string;
    phone?: string;
  };

  // Color scheme
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    danger: string;
    warning: string;
    background: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
  };

  // Typography
  fonts: {
    primary: string;
    bold: string;
    sizes: {
      title: number;
      subtitle: number;
      header: number;
      body: number;
      small: number;
    };
  };

  // Layout
  layout: {
    pageMargin: number;
    headerHeight: number;
    footerHeight: number;
    sectionSpacing: number;
  };

  // Features
  features: {
    watermark: boolean;
    pageNumbers: boolean;
    tableOfContents: boolean;
    executiveSummary: boolean;
    recommendations: boolean;
    charts: boolean;
  };

  // Report-specific settings
  reports: {
    submissionStatus: {
      includeAnalytics: boolean;
      showTrends: boolean;
      highlightIssues: boolean;
    };
    approvalStatus: {
      includeWorkflow: boolean;
      showProcessingTime: boolean;
      includeRecommendations: boolean;
    };
    detailedTimesheet: {
      includeProjectBreakdown: boolean;
      showProductivityMetrics: boolean;
      includeUtilizationAnalysis: boolean;
    };
  };
}