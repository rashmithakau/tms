export interface UseReportTypeOptions {
  initialType?: 'submission-status' | 'approval-status' | 'detailed-timesheet' | 'timesheet-entries' | '';
}

export interface UseReportTypeReturn {
  reportType: 'submission-status' | 'approval-status' | 'detailed-timesheet' | 'timesheet-entries' | '';
  setReportType: (type: 'submission-status' | 'approval-status' | 'detailed-timesheet' | 'timesheet-entries' | '') => void;
}
