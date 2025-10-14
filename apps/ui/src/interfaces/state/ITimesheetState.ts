import { TimesheetStatus, otherActivity } from '@tms/shared';
import { TimesheetData } from '../hooks/timesheet';

export interface ITimesheetState {
  selectedActivities: otherActivity[];
  timesheetData: TimesheetData[];
  weekStartDate: string | null;
  weekEndDate: string | null;
  currentTimesheetId: string | null;
  status: TimesheetStatus | null;
  originalDataHash: string | null;
  isDraftSaved: boolean;
}
