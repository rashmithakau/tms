import { useState } from 'react';
import { TimesheetStatus } from '@tms/shared';
import { TimesheetData, TimesheetItem } from './useTimesheetDataManagement';
import { EditState } from '../../interfaces';

export const useTimesheetCellEditing = (
  data: TimesheetData[],
  updateData: (newData: TimesheetData[]) => void,
  timesheetStatus?: string | null
) => {
  const [editCell, setEditCell] = useState<EditState | null>(null);
  const [editDescription, setEditDescription] = useState<EditState | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Check if a cell is editable based on timesheet and day status
  const isCellEditable = (catIndex: number, rowIndex: number, colIndex: number): boolean => {
    if (!timesheetStatus || !['Draft', 'Rejected'].includes(timesheetStatus)) {
      return false;
    }

    // If status is Rejected, only allow editing rejected days
    if (timesheetStatus === 'Rejected') {
      const item = data[catIndex]?.items[rowIndex];
      const dayStatus = item?.dailyStatus?.[colIndex];
      return dayStatus === TimesheetStatus.Rejected;
    }

    return true; // Draft status allows editing all cells
  };

  // Handle hours cell click
  const handleCellClick = (catIndex: number, rowIndex: number, colIndex: number) => {
    if (!isCellEditable(catIndex, rowIndex, colIndex)) return;
    setEditCell({ cat: catIndex, row: rowIndex, col: colIndex });
  };

  // Handle hours cell value change with validation
  const handleCellChange = (
    catIndex: number,
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    // Validate hours format (e.g., 08.50, 12.75)
    if (value && !/^\d{0,2}(\.\d{0,2})?$/.test(value)) return;

    const newData = structuredClone(data);
    newData[catIndex].items[rowIndex].hours[colIndex] = 
      value.trim() === '' ? '00.00' : value;
    updateData(newData);
  };

  // Handle description icon click
  const handleDescriptionClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    catIndex: number,
    rowIndex: number,
    colIndex: number
  ) => {
    if (!isCellEditable(catIndex, rowIndex, colIndex)) return;
    
    setAnchorEl(e.currentTarget);
    setEditDescription({ cat: catIndex, row: rowIndex, col: colIndex });
  };

  // Handle description value change
  const handleDescriptionChange = (
    catIndex: number,
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    const newData = structuredClone(data);
    newData[catIndex].items[rowIndex].descriptions[colIndex] = value;
    updateData(newData);
  };

  // Close editors
  const closeEditCell = () => setEditCell(null);
  const closeDescriptionEditor = () => {
    setAnchorEl(null);
    setEditDescription(null);
  };

  // Handle key events for cell editing
  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      closeEditCell();
    }
  };

  return {
    editCell,
    editDescription,
    anchorEl,
    isCellEditable,
    handleCellClick,
    handleCellChange,
    handleDescriptionClick,
    handleDescriptionChange,
    closeEditCell,
    closeDescriptionEditor,
    handleCellKeyDown,
  };
};