import { ITimeSheetRow } from '../../../interfaces/entity/ITimeSheetRow';

export interface ITimesheetSelectionRowProps {
  timesheet: ITimeSheetRow;
  isSelected: boolean;
  isPending: boolean;
  onSelectionChange: (id: string, selected: boolean) => void;
}