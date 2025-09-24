import React from 'react';

export interface IRejectedTimesheetItem {
  id: string;
  employeeName: string;
  workName: string;
  reason: string;
  rejectedDate: string;
  timesheetId: string;
  projectName?: string;
}

export interface IRejectedTimesheetsProps {
  rejectedTimesheets: IRejectedTimesheetItem[];
  onViewTimesheet?: (timesheetId: string) => void;
  maxItems?: number;
}
