export interface TimeSheetRow {
  _id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  project: string;
  task: string;
  billableType: 'Billable' | 'Non Billable';
  status: 'Pending' | 'Approved' | 'Rejected';
  description?: string;
  plannedHours?: number;
  hoursSpent?: number;
}


