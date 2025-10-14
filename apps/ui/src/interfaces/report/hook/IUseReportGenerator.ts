import {
  ReportFilter,
  Employee,
  ReportMetadata
} from '../../../api/report';
export interface UseReportGeneratorOptions {
  onSuccess?: (filename: string) => void;
  onError?: (error: string) => void;
}

export interface UseReportGeneratorReturn {
  isGenerating: boolean;
  supervisedEmployees: Employee[];
  reportMetadata: ReportMetadata | null;
  isLoadingEmployees: boolean;
  isLoadingMetadata: boolean;
  error: string | null;
  generateSubmissionReport: (filter: ReportFilter, format: 'pdf' | 'excel') => Promise<void>;
  generateApprovalReport: (filter: ReportFilter, format: 'pdf' | 'excel') => Promise<void>;
  generateDetailedReport: (filter: ReportFilter, format: 'pdf' | 'excel') => Promise<void>;
  generateTimesheetEntries: (filter: ReportFilter, format: 'pdf' | 'excel') => Promise<void>;
  refreshEmployees: () => Promise<void>;
  refreshMetadata: () => Promise<void>;
  clearError: () => void;
}