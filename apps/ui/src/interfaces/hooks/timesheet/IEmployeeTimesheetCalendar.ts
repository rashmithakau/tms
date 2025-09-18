import { ITimeSheetRow } from '../../entity/ITimeSheetRow';
import { TimesheetData } from './ITimesheetDataManagement';
import { DayInfo } from '../WeekDays';

export interface EmployeeTimesheetCalendarParams {
  timesheets: ITimeSheetRow[];
  originalTimesheets?: any[];
  supervisedProjectIds?: string[];
  supervisedTeamIds?: string[];
}

export interface EmployeeTimesheetCalendarReturn {
  data: TimesheetData[];
  days: DayInfo[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentWeekStart: Date;
  setCurrentWeekStart: (date: Date) => void;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  weekOriginalTimesheet: any;
  supervisedProjectIds: string[];
  supervisedTeamIds: string[];
}