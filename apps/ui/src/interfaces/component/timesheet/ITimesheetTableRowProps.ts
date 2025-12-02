import React from 'react';
import { TimesheetItem as ITimesheetItem } from '../../../interfaces/hooks/timesheet';

export interface ITimesheetTableRowProps {
  item: ITimesheetItem;
  categoryName?: string;
  rowSpan?: number;
  isFirstRowInCategory: boolean;
  catIndex: number;
  rowIndex: number;
  editCell: { cat: number; row: number; col: number } | null;
  isCellEditable: (catIndex: number, rowIndex: number, colIndex: number) => boolean;
  onCellClick: (catIndex: number, rowIndex: number, colIndex: number) => void;
  onCellChange: (catIndex: number, rowIndex: number, colIndex: number, value: string) => void;
  onCellKeyDown: (e: React.KeyboardEvent) => void;
  onDescriptionClick: (e: React.MouseEvent<HTMLButtonElement>, catIndex: number, rowIndex: number, colIndex: number) => void;
  calcRowTotal: (hours: string[]) => string;
}