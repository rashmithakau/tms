export interface ReportTypeSelectProps {
  reportType: '' | 'submission-status' | 'approval-status' | 'detailed-timesheet' | 'timesheet-entries' | null;
  onReportTypeChange?: (
    value: '' | 'submission-status' | 'approval-status' | 'detailed-timesheet' | 'timesheet-entries'
  ) => void;
  disabled?: boolean;
}