import { DaySelection } from '../../hooks/timesheet';

export interface IEmployeeTimesheetCalendarProps {
  employeeId: string;
  employeeName: string;
  timesheets: any[];
  originalTimesheets?: any[];
  supervisedProjectIds?: string[];
  supervisedTeamIds?: string[];
  supervisedUserIds?: string[];
  currentSupervisorId?: string;
  onDaySelectionChange?: (selections: DaySelection[]) => void;
  selectedDays?: DaySelection[];
  isSelectionMode?: boolean;
  onApproveEditRequest?: (timesheetId: string) => void;
  onRejectEditRequest?: (timesheetId: string) => void;
  isApprovingEditRequest?: boolean;
  isRejectingEditRequest?: boolean;
}