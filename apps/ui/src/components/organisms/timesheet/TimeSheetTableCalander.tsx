import React, { useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { TimesheetStatus } from '@tms/shared';
import theme from '../../../styles/theme';
import { useTimesheetDataManagement } from '../../../hooks/timesheet/useTimesheetDataManagement';
import { useTimesheetCellEditing } from '../../../hooks/timesheet/useTimesheetCellEditing';
import { useTimesheetCalculations } from '../../../hooks/util/useTimesheetCalculations';
import { useWeekDays } from '../../../hooks/navigation/useWeekDays';
import TimesheetTableHeader from '../../molecules/timesheet/TimesheetTableHeader';
import TimesheetTableRow from '../../molecules/timesheet/TimesheetTableRow';
import DescriptionEditor from '../../molecules/common/dialog/DescriptionEditor';
import PageLoading from '../../molecules/common/loading/PageLoading';
import StatusDot from '../../atoms/common/StatusDot';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const TimeSheetTableCalendar: React.FC = () => {

  const { data, updateData, timesheetStatus, isLoading, error } = useTimesheetDataManagement();
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
    closeEditCell,
    closeDescriptionEditor,
    handleCellKeyDown,
  } = useTimesheetCellEditing(data, updateData, timesheetStatus || undefined);
  const { calcRowTotal, columnTotals, grandTotal } = useTimesheetCalculations(data);
  
  // Calculate total hours from grandTotal
  const totalHours = parseFloat(grandTotal || '0');
  
  // Ref for the table container
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the table to close edit cell
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tableContainerRef.current && !tableContainerRef.current.contains(event.target as Node)) {
        closeEditCell();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeEditCell]);

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Box sx={{ m: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      {isLoading ? (
        <PageLoading variant="inline" message="Loading timesheet..." />
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
              Status :
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StatusDot color="#4caf50" />
              <Typography variant="body2">Approved</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StatusDot color="#ff9800" />
              <Typography variant="body2">Pending</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StatusDot color="#f44336" />
              <Typography variant="body2">Rejected</Typography>
            </Box>
          </Box>

          {totalHours < 40 && (timesheetStatus === TimesheetStatus.Draft || timesheetStatus === TimesheetStatus.Rejected) && (
            <Alert 
              severity="info" 
              icon={<InfoOutlinedIcon />}
              sx={{ 
                mb: 2,
                backgroundColor: '#e3f2fd',
                '& .MuiAlert-icon': {
                  color: '#1976d2'
                }
              }}
            >
              You need a minimum of 40 hours to submit your timesheet. Current total: {totalHours.toFixed(2)} hours
            </Alert>
          )}

          <TableContainer ref={tableContainerRef} sx={{ width: '100%' }}>
        <Table sx={{ width: '100%' }}>
          <TimesheetTableHeader days={days} />
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="left" sx={{ py: 4, textAlign: 'left' }}>
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

            {data.length > 0 && (
              <TableRow sx={{ backgroundColor: theme.palette.grey[200] }}>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: '16px', paddingRight: '16px' }}>Total</TableCell>
                <TableCell sx={{ paddingLeft: '16px', paddingRight: '16px' }} />
                {columnTotals.map((total, colIndex) => (
                  <TableCell key={colIndex} align="left" sx={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: '16px', paddingRight: '16px' }}>
                    {total}
                  </TableCell>
                ))}
                <TableCell align="left" sx={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: '16px', paddingRight: '16px' }}>
                  {grandTotal}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
        </>
      )}

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
