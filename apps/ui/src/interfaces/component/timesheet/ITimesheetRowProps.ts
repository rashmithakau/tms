export interface ITimesheetRowProps {
  row: any;
  rowIndex: number;
  catIndex: number;
  days: { day: string; date: Date }[];
  isSelectionMode: boolean;
  isDaySelected: (catIndex: number, rowIndex: number, colIndex: number) => boolean;
  handleDaySelectionChange: (catIndex: number, rowIndex: number, colIndex: number, checked: boolean) => void;
  supervisedProjectIds: string[];
  supervisedTeamIds: string[];
}