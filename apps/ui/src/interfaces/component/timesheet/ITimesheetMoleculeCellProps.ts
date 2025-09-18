import { TimesheetStatus } from '@tms/shared';

export interface ITimesheetMoleculeCellProps {
  hour: string;
  description: string;
  dailyStatus: TimesheetStatus;
  isSelected: boolean;
  isSelectionMode: boolean;
  isCheckboxDisabled: boolean;
  hasHours: boolean;
  onCheckboxChange: (checked: boolean) => void;
  canApprove: boolean;
}