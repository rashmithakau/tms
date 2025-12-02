export interface DaySelection {
  timesheetId: string;
  categoryIndex: number;
  itemIndex: number;
  dayIndex: number;
}

export interface EditState {
  cat: number;
  row: number;
  col: number;
}

export interface TimesheetCellEditingReturn {
  editCell: EditState | null;
  editDescription: EditState | null;
  anchorEl: HTMLElement | null;
  isCellEditable: (catIndex: number, rowIndex: number, colIndex: number) => boolean;
  handleCellClick: (catIndex: number, rowIndex: number, colIndex: number) => void;
  handleCellChange: (catIndex: number, rowIndex: number, colIndex: number, value: string) => void;
  handleDescriptionClick: (e: React.MouseEvent<HTMLButtonElement>, catIndex: number, rowIndex: number, colIndex: number) => void;
  handleDescriptionChange: (catIndex: number, rowIndex: number, colIndex: number, value: string) => void;
  closeEditCell: () => void;
  closeDescriptionEditor: () => void;
  handleCellKeyDown: (e: React.KeyboardEvent, descriptionButtonEvent?: React.MouseEvent<HTMLButtonElement>) => void;
  handleDescriptionKeyDown: (e: React.KeyboardEvent) => void;
  closeDescriptionAndMoveNext: () => void;
}