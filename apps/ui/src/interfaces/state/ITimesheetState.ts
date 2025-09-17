import { TimesheetStatus, absenceActivity } from '@tms/shared';
import { TimesheetData } from '../../hooks/timesheet/useTimesheetDataManagement';

export interface ITimesheetState {
  selectedActivities: absenceActivity[];
  timesheetData: TimesheetData[];
  weekStartDate: string | null;
  weekEndDate: string | null;
  currentTimesheetId: string | null;
  status: TimesheetStatus | null;
  originalDataHash: string | null;
  isDraftSaved: boolean;
}
