import { useState } from 'react';
import { TimesheetStatus } from '@tms/shared';
import { 
  TimesheetData,  
  EditState,
  TimesheetCellEditingReturn 
} from '../../interfaces/hooks/timesheet';

export const useTimesheetCellEditing = (
  data: TimesheetData[],
  updateData: (newData: TimesheetData[]) => void,
  timesheetStatus?: string | null
): TimesheetCellEditingReturn => {
  const [editCell, setEditCell] = useState<EditState | null>(null);
  const [editDescription, setEditDescription] = useState<EditState | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);


  const isCellEditable = (catIndex: number, rowIndex: number, colIndex: number): boolean => {
    if (!timesheetStatus || ![TimesheetStatus.Draft, TimesheetStatus.Rejected].includes(timesheetStatus as TimesheetStatus)) {
      return false;
    }

    if (timesheetStatus === TimesheetStatus.Rejected) {
      const item = data[catIndex]?.items[rowIndex];
      const dayStatus = item?.dailyStatus?.[colIndex];
      return dayStatus === TimesheetStatus.Rejected;
    }

    return true; 
  };


  const handleCellClick = (catIndex: number, rowIndex: number, colIndex: number) => {
    if (!isCellEditable(catIndex, rowIndex, colIndex)) return;
    setEditCell({ cat: catIndex, row: rowIndex, col: colIndex });
  };


  const handleCellChange = (
    catIndex: number,
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {

    if (value && !/^\d{0,2}(\.\d{0,2})?$/.test(value)) return;

    const newData = structuredClone(data);
    newData[catIndex].items[rowIndex].hours[colIndex] = 
      value.trim() === '' ? '00.00' : value;
    updateData(newData);
  };


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


  const closeEditCell = () => setEditCell(null);
  const closeDescriptionEditor = () => {
    setAnchorEl(null);
    setEditDescription(null);
  };

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