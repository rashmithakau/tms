import React from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  Box,
  Typography,
} from '@mui/material';
import theme from '../../styles/theme';
import { useTimesheetDataManagement } from '../../hooks/useTimesheetDataManagement';
import { useTimesheetCellEditing } from '../../hooks/useTimesheetCellEditing';
import { useTimesheetCalculations } from '../../hooks/useTimesheetCalculations';
import { useWeekDays } from '../../hooks/useWeekDays';
import TimesheetTableHeader from '../molecules/TimesheetTableHeader';
import TimesheetTableRow from '../molecules/TimesheetTableRow';
import DescriptionEditor from '../molecules/DescriptionEditor';

export interface TimesheetItem {
  work?: string;
  projectId?: string;
  hours: string[];
  descriptions: string[];
  dailyStatus?: any[]; // Using any[] to match existing types
}

export interface TimesheetData {
  category: 'Project' | 'Absence';
  items: TimesheetItem[];
}

const TimeSheetTableCalendar: React.FC = () => {
  // Custom hooks for business logic
  const { data, updateData, timesheetStatus } = useTimesheetDataManagement();
  const { days } = useWeekDays();
  const {
    editCell,
    editDescription,
    anchorEl,
    isCellEditable,
    handleCellClick,
    handleCellChange,
    handleDescriptionClick,
    handleDescriptionChange,
    closeDescriptionEditor,
    handleCellKeyDown,
  } = useTimesheetCellEditing(data, updateData, timesheetStatus || undefined);
  const { calcRowTotal, columnTotals, grandTotal } = useTimesheetCalculations(data);

  return (
    <Box>
      <TableContainer>
        <Table>
          <TimesheetTableHeader days={days} />
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No timesheet data available. Please select work activities to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((cat, catIndex) => (
                <React.Fragment key={catIndex}>
                  {cat.items.map((item, rowIndex) => (
                    <TimesheetTableRow
                      key={rowIndex}
                      item={item}
                      categoryName={cat.category}
                      rowSpan={cat.items.length}
                      isFirstRowInCategory={rowIndex === 0}
                      catIndex={catIndex}
                      rowIndex={rowIndex}
                      editCell={editCell}
                      isCellEditable={isCellEditable}
                      onCellClick={handleCellClick}
                      onCellChange={handleCellChange}
                      onCellKeyDown={handleCellKeyDown}
                      onDescriptionClick={handleDescriptionClick}
                      calcRowTotal={calcRowTotal}
                    />
                  ))}
                </React.Fragment>
              ))
            )}

            {/* Total Row */}
            {data.length > 0 && (
              <TableRow sx={{ backgroundColor: theme.palette.grey[200] }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell />
                {columnTotals.map((total, colIndex) => (
                  <TableCell key={colIndex} align="center" sx={{ fontWeight: 'bold' }}>
                    {total}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  {grandTotal}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Description Editor */}
      <DescriptionEditor
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        value={
          editDescription
            ? data[editDescription.cat]?.items[editDescription.row]?.descriptions[
                editDescription.col
              ] || ''
            : ''
        }
        onChange={(value) => {
          if (editDescription) {
            handleDescriptionChange(
              editDescription.cat,
              editDescription.row,
              editDescription.col,
              value
            );
          }
        }}
        onClose={closeDescriptionEditor}
      />
    </Box>
  );
};

export default TimeSheetTableCalendar;
