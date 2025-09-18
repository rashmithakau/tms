import { TimesheetStatus } from '@tms/shared';

export interface IDayCheckboxProps {
  day: string;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
  status?: TimesheetStatus;
  disabled?: boolean;
}