export interface ReportFilterContainerProps {
  supervisedEmployees: any[];
  reportMetadata: any;
  onFilterChange: (filter: any) => void;
  reportType: 'submission-status' | 'approval-status' | 'detailed-timesheet' | 'timesheet-entries' | '';
  onReportTypeChange: (type: any) => void;
  disabled: boolean;
  resetSignal: number;
  isGenerating: boolean;
  onGenerateReport: (format: 'pdf' | 'excel') => void;
  error: string | null;
  onResetFilters: () => void;
}
