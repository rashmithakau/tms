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
    newData[catIndex].items[rowIndex].hours[colIndex] = value;
    updateData(newData);
  };

  const formatHourValue = (value: string): string => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    if (!cleanValue || cleanValue === '') return '00.00';
    
    const numValue = parseFloat(cleanValue);
    
    if (isNaN(numValue)) return '00.00';
    
    // Check if there's a decimal point
    const parts = cleanValue.split('.');
    
    if (parts.length === 2) {
      let intPart = parseInt(parts[0]) || 0;
      const decPart = parts[1];
      
      // If hours exceed 24, set to 00.00
      if (intPart > 24) {
        return '00.00';
      }
      
      // If exactly 24 hours, check minutes
      if (intPart === 24) {
        const minutes = decPart.length === 1 ? parseInt(decPart) * 10 : parseInt(decPart);
        // If 24.00 or less, allow it; otherwise set to 00.00
        if (minutes > 0) {
          return '00.00';
        }
        return '24.00';
      }
      
      // If decimal part has only 1 digit, treat it as X.Y0
      if (decPart.length === 1) {
        const decValue = parseInt(decPart) * 10;
        // Validate minutes don't exceed 59
        if (decValue > 59) {
          return `${intPart.toString().padStart(2, '0')}.59`;
        }
        return `${intPart.toString().padStart(2, '0')}.${decValue.toString().padStart(2, '0')}`;
      }
      
      // If decimal part has 2 digits
      if (decPart.length === 2) {
        const decValue = parseInt(decPart);
        // Validate minutes don't exceed 59
        if (decValue > 59) {
          return `${intPart.toString().padStart(2, '0')}.59`;
        }
        return `${intPart.toString().padStart(2, '0')}.${decValue.toString().padStart(2, '0')}`;
      }
    }
    
    // No decimal point, just a whole number
    const hours = Math.floor(numValue);
    
    // If hours exceed 24, set to 00.00
    if (hours > 24) {
      return '00.00';
    }
    
    return `${hours.toString().padStart(2, '0')}.00`;
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


  const closeEditCell = () => {
    // Format the value when closing the cell
    if (editCell) {
      const { cat, row, col } = editCell;
      const currentValue = data[cat]?.items[row]?.hours[col] || '';
      const formattedValue = formatHourValue(currentValue);
      
      const newData = structuredClone(data);
      newData[cat].items[row].hours[col] = formattedValue;
      updateData(newData);
    }
    setEditCell(null);
  };
  
  const openDescriptionForCurrentCell = () => {
    if (!editCell) return null;
    
    const { cat, row, col } = editCell;
    
    // First format and save the current cell
    const currentValue = data[cat]?.items[row]?.hours[col] || '';
    const formattedValue = formatHourValue(currentValue);
    const newData = structuredClone(data);
    newData[cat].items[row].hours[col] = formattedValue;
    updateData(newData);
    
    // Close the edit cell
    setEditCell(null);
    
    // Return the cell position to open description
    return { cat, row, col };
  };
  
  const moveToNextCell = () => {
    if (!editCell) return;
    
    const { cat, row, col } = editCell;
    
    // Find the next editable cell
    let nextCat = cat;
    let nextRow = row;
    let nextCol = col + 1; // Move to next column (next day)
    
    // Check if we need to move to next row
    if (nextCol >= 7) { // 7 days in a week
      nextCol = 0;
      nextRow++;
      
      // Check if we need to move to next category
      if (nextRow >= data[nextCat].items.length) {
        nextRow = 0;
        nextCat++;
        
        // If we're at the end, wrap to the beginning
        if (nextCat >= data.length) {
          nextCat = 0;
        }
      }
    }
    
    // Find the next editable cell (skip non-editable cells)
    let attempts = 0;
    const maxAttempts = data.reduce((sum, cat) => sum + cat.items.length * 7, 0);
    
    while (attempts < maxAttempts) {
      if (isCellEditable(nextCat, nextRow, nextCol)) {
        setEditCell({ cat: nextCat, row: nextRow, col: nextCol });
        return;
      }
      
      // Move to next cell
      nextCol++;
      if (nextCol >= 7) {
        nextCol = 0;
        nextRow++;
        
        if (nextRow >= data[nextCat].items.length) {
          nextRow = 0;
          nextCat++;
          
          if (nextCat >= data.length) {
            nextCat = 0;
          }
        }
      }
      
      attempts++;
    }
    
    // If no editable cell found, just close
    setEditCell(null);
  };
  
  const closeDescriptionAndMoveNext = () => {
    if (!editDescription) return;
    
    const { cat, row, col } = editDescription;
    
    // Close the description editor first
    closeDescriptionEditor();
    
    // Find the next editable cell starting from current position
    let nextCat = cat;
    let nextRow = row;
    let nextCol = col + 1; // Move to next column (next day)
    
    // Check if we need to move to next row
    if (nextCol >= 7) { // 7 days in a week
      nextCol = 0;
      nextRow++;
      
      // Check if we need to move to next category
      if (nextRow >= data[nextCat].items.length) {
        nextRow = 0;
        nextCat++;
        
        // If we're at the end, wrap to the beginning
        if (nextCat >= data.length) {
          nextCat = 0;
        }
      }
    }
    
    // Find the next editable cell (skip non-editable cells)
    let attempts = 0;
    const maxAttempts = data.reduce((sum, cat) => sum + cat.items.length * 7, 0);
    
    while (attempts < maxAttempts) {
      if (isCellEditable(nextCat, nextRow, nextCol)) {
        setEditCell({ cat: nextCat, row: nextRow, col: nextCol });
        return;
      }
      
      // Move to next cell
      nextCol++;
      if (nextCol >= 7) {
        nextCol = 0;
        nextRow++;
        
        if (nextRow >= data[nextCat].items.length) {
          nextRow = 0;
          nextCat++;
          
          if (nextCat >= data.length) {
            nextCat = 0;
          }
        }
      }
      
      attempts++;
    }
    
    // If no editable cell found, just keep closed
  };
  
  const closeDescriptionEditor = () => {
    setAnchorEl(null);
    setEditDescription(null);
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, descriptionButtonEvent?: React.MouseEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cellPos = openDescriptionForCurrentCell();
      if (cellPos && descriptionButtonEvent) {
        // Use the description button as anchor element
        setAnchorEl(descriptionButtonEvent.currentTarget);
        setEditDescription({ cat: cellPos.cat, row: cellPos.row, col: cellPos.col });
      }
    } else if (e.key === 'Escape') {
      closeEditCell();
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      closeDescriptionAndMoveNext();
    } else if (e.key === 'Escape') {
      closeDescriptionEditor();
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
    handleDescriptionKeyDown,
    closeDescriptionAndMoveNext,
  };
};