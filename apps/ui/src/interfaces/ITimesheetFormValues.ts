export interface ITimesheetFormValues {
  date: string;
  projectName: string;
  taskTitle: string;
  description?: string;
  plannedHours?: string;
  hoursSpent?: string;
  billableType: 'Billable' | 'Non Billable';
}

