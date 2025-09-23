export interface ReportTypeSelectProps {
  reportType: string | null;
  onReportTypeChange?: (
    value: 'submission-status' | 'approval-status' | 'detailed-timesheet'
  ) => void;
  disabled?: boolean;
}