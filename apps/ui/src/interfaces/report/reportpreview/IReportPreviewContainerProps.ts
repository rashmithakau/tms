export interface ReportPreviewContainerProps {
  isLoading: boolean;
  error: string | null;
  supervisedEmployeesCount: number;
  reportType: 'submission-status' | 'approval-status' | 'detailed-timesheet' | 'timesheet-entries' | '';
  previewColumns: { key: string; header: string }[];
  previewRows: any[];
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
  onClearError: () => void;
}
