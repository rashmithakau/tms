import { TimesheetStatus } from '@tms/shared';

export interface TimesheetItem {
  work?: string;
  projectId?: string;
  teamId?: string;
  hours: string[];
  descriptions: string[];
  dailyStatus?: TimesheetStatus[];
}

export interface TimesheetData {
  category: 'Project' | 'Team' | 'Absence';
  items: TimesheetItem[];
}

export interface TimesheetDataManagementReturn {
  data: TimesheetData[];
  updateData: (newData: TimesheetData[]) => void;
  timesheetStatus: string | null;
  selectedWeekStartIso: string | null;
  isLoading: boolean;
  error: string | null;
}