import { DaySelection } from '../../hooks/timesheet';

export interface IEmployeeTimesheetCalendarProps {
  employeeId: string;
  employeeName: string;
  timesheets: any[];
  originalTimesheets?: any[];
  supervisedProjectIds?: string[];
  supervisedTeamIds?: string[];
  onDaySelectionChange?: (selections: DaySelection[]) => void;
  selectedDays?: DaySelection[];
  isSelectionMode?: boolean;
}