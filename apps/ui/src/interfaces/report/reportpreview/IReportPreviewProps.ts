import { ReportFilter } from '../../api';

export interface UseReportPreviewOptions {
  reportType: 'submission-status' | 'approval-status' | 'detailed-timesheet' | 'timesheet-entries' | '';
  filter: ReportFilter;
}

export interface UseReportPreviewReturn {
  previewRows: any[];
  previewColumns: { key: string; header: string }[];
  groupedPreviewData: {
    [employeeKey: string]: {
      employeeName: string;
      employeeEmail: string;
      tables: Array<{
        title: string;
        columns: { key: string; header: string }[];
        rows: any[];
      }>;
    };
  };
  isLoadingPreview: boolean;
  previewError: string | null;
  loadPreview: () => Promise<void>;
}
