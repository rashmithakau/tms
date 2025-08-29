import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  Box,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import TimesheetWeekHeader from '../molecules/TimesheetWeekHeader';
import TimesheetRow from '../molecules/TimesheetRow';
import TimesheetTotalRow from '../molecules/TimesheetTotalRow';
import DescriptionPopover from '../molecules/DescriptionPopover';
import { useTimesheetCalendar } from '../../hooks/useTimesheetCalendar';
import { useTimesheetCalculations } from '../../hooks/useTimesheetCalculations';

export interface TimesheetItem {
  work?: string;
  projectId?: string;
  hours: string[];
  descriptions: string[];
}

export interface TimesheetData {
  category: 'Project' | 'Absence';
  items: TimesheetItem[];
}

const TimeSheetTableCalendar: React.FC = () => {
  const { data, days, loading, error, timesheetStatus, updateTimesheetData, isCreatingTimesheet } = useTimesheetCalendar();
  const { getColumnTotals, calcGrandTotal } = useTimesheetCalculations(data);
  
  const [editCell, setEditCell] = useState<{
    cat: number;
    row: number;
    col: number;
  } | null>(null);

  const [editDescription, setEditDescription] = useState<{
    cat: number;
    row: number;
    col: number;
  } | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Read-only state
  const isReadOnly = timesheetStatus !== 'Draft';

  // --- Hours edit ---
  const handleCellClick = (
    catIndex: number,
    rowIndex: number,
    colIndex: number
  ) => {
    if (isReadOnly) return;
    setEditCell({ cat: catIndex, row: rowIndex, col: colIndex });
  };

  const handleCellChange = (
    catIndex: number,
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    updateTimesheetData(data.map((category, catIdx) => {
      if (catIdx !== catIndex) return category;
      return {
        ...category,
        items: category.items.map((item, rowIdx) => {
          if (rowIdx !== rowIndex) return item;
          const newHours = [...item.hours];
          newHours[colIndex] = value.trim() === '' ? '00.00' : value;
          return { ...item, hours: newHours };
        })
      };
    }));
  };

  const handleHourBlur = () => {
    setEditCell(null);
  };

  // --- Description edit ---
  const handleDescriptionClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    catIndex: number,
    rowIndex: number,
    colIndex: number
  ) => {
    if (isReadOnly) return;
    setAnchorEl(e.currentTarget);
    setEditDescription({ cat: catIndex, row: rowIndex, col: colIndex });
  };

  const handleDescriptionChange = (value: string) => {
    if (!editDescription) return;
    
    const { cat: catIndex, row: rowIndex, col: colIndex } = editDescription;
    updateTimesheetData(data.map((category, catIdx) => {
      if (catIdx !== catIndex) return category;
      return {
        ...category,
        items: category.items.map((item, rowIdx) => {
          if (rowIdx !== rowIndex) return item;
          const newDescriptions = [...item.descriptions];
          newDescriptions[colIndex] = value;
          return { ...item, descriptions: newDescriptions };
        })
      };
    }));
  };

  const handleDescriptionClose = () => {
    setAnchorEl(null);
    setEditDescription(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditCell(null);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
        {isCreatingTimesheet && (
          <Box ml={2}>
            <Typography variant="body2" color="text.secondary">
              Creating timesheet for this week...
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const columnTotals = getColumnTotals(7);
  const grandTotal = calcGrandTotal();

  return (
    <Box>
      <TableContainer>
        <Table>
          <TimesheetWeekHeader days={days} />
          
          <TableBody>
            {data.map((category, catIndex) => (
              <React.Fragment key={catIndex}>
                {category.items.map((item: TimesheetItem, rowIndex: number) => (
                  <TimesheetRow
                    key={rowIndex}
                    item={item}
                    categoryIndex={catIndex}
                    rowIndex={rowIndex}
                    isFirstRowInCategory={rowIndex === 0}
                    categoryName={category.category}
                    categoryRowSpan={category.items.length}
                    editCell={editCell}
                    readOnly={isReadOnly}
                    onCellClick={handleCellClick}
                    onHourChange={handleCellChange}
                    onHourBlur={handleHourBlur}
                    onDescriptionClick={handleDescriptionClick}
                    onKeyDown={handleKeyDown}
                  />
                ))}
              </React.Fragment>
            ))}

            <TimesheetTotalRow
              days={7}
              columnTotals={columnTotals}
              grandTotal={grandTotal}
            />
          </TableBody>
        </Table>
      </TableContainer>

      <DescriptionPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        description={
          editDescription
            ? data[editDescription.cat]?.items[editDescription.row]?.descriptions[editDescription.col] || ''
            : ''
        }
        onClose={handleDescriptionClose}
        onChange={handleDescriptionChange}
      />
    </Box>
  );
};

export default TimeSheetTableCalendar;
