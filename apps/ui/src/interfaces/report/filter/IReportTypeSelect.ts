export interface ReportTypeSelectProps {
  reportType: '' | 'submission-status' | 'approval-status' | 'detailed-timesheet' | null;
  onReportTypeChange?: (
    value: '' | 'submission-status' | 'approval-status' | 'detailed-timesheet'
  ) => void;
  disabled?: boolean;
}