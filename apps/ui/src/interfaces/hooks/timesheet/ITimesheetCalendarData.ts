import { DayInfo } from '../../../interfaces';

export interface TimesheetCalendarDataReturn {
  data: any[];
  days: DayInfo[];
  isLoading: boolean;
  currentWeekStart: Date;
  setCurrentWeekStart: (date: Date) => void;
  projects: any[];
}