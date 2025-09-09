import React from 'react';
import { Table, TableBody, TableContainer, Box, IconButton, Typography, CircularProgress, TableCell } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import theme from '../../styles/theme';
import TimesheetTableHeader from '../molecules/TimesheetTableHeader';
import TimesheetRow from '../molecules/TimesheetRow';
import TimesheetTotalRow from '../molecules/TimesheetTotalRow';
import { useEmployeeTimesheetCalendar, DaySelection } from '../../hooks/useEmployeeTimesheetCalendar';

interface EmployeeTimesheetCalendarProps {
  employeeId: string;
  employeeName: string;
  timesheets: any[];
  originalTimesheets?: any[];
  supervisedProjectIds?: string[];
  onDaySelectionChange?: (selections: DaySelection[]) => void;
  selectedDays?: DaySelection[];
  isSelectionMode?: boolean;
}

const EmployeeTimesheetCalendar: React.FC<EmployeeTimesheetCalendarProps> = ({
  employeeId,
  employeeName,
  timesheets,
  originalTimesheets = [],
  supervisedProjectIds = [],
  onDaySelectionChange,
  selectedDays = [],
  isSelectionMode = false,
}) => {
  const {
    data,
    days,
    isLoading,
    setIsLoading,
    currentWeekStart,
    handlePreviousWeek,
    handleNextWeek,
    weekOriginalTimesheet,
    supervisedProjectIds: supervisedIds,
  } = useEmployeeTimesheetCalendar({ timesheets, originalTimesheets, supervisedProjectIds });

  // Selection logic
  const isDaySelected = (categoryIndex: number, itemIndex: number, dayIndex: number) => {
    if (!isSelectionMode) return false;
    return selectedDays.some(selection =>
      selection.categoryIndex === categoryIndex &&
      selection.itemIndex === itemIndex &&
      selection.dayIndex === dayIndex
    );
  };

  const handleDaySelectionChange = (categoryIndex: number, itemIndex: number, dayIndex: number, selected: boolean) => {
    if (!isSelectionMode || !onDaySelectionChange) return;
    const actualTimesheetId = weekOriginalTimesheet?._id;
    if (!actualTimesheetId) return;
    const selectionKey = {
      timesheetId: actualTimesheetId,
      categoryIndex,
      itemIndex,
      dayIndex,
    };
    let newSelections: DaySelection[];
    if (selected) {
      newSelections = [...selectedDays, selectionKey];
    } else {
      newSelections = selectedDays.filter(selection =>
        !(selection.categoryIndex === categoryIndex &&
          selection.itemIndex === itemIndex &&
          selection.dayIndex === dayIndex)
      );
    }
    onDaySelectionChange(newSelections);
  };

  // Totals
  const calcColTotal = (colIndex: number) =>
    data.flatMap(cat => cat.items).reduce((sum, row) => sum + parseFloat(row.hours[colIndex] || '0'), 0).toFixed(2);
  const calcGrandTotal = () =>
    data.flatMap(cat => cat.items).reduce((sum, row) => sum + row.hours.reduce((s, h) => s + parseFloat(h || '0'), 0), 0).toFixed(2);

  const weekEndDate = new Date(currentWeekStart);
  weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);

  return (
    <Box>
      {/* Header with employee name and week navigation */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        p: 2,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
      }}>
        <Typography variant="h6" component="h3">
          {employeeName}'s Timesheet
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handlePreviousWeek} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: 200, textAlign: 'center' }}>
            {currentWeekStart.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: '2-digit',
              timeZone: 'UTC',
            })}
            &nbsp;to&nbsp;
            {weekEndDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </Typography>
          <IconButton onClick={handleNextWeek} size="small">
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TimesheetTableHeader days={days} />
            <TableBody>
              {data.length === 0 ? (
                <tr>
                  <TableCell colSpan={9} align="center" style={{ padding: '32px 0' }}>
                    <Typography color="textSecondary">No timesheet data for this week</Typography>
                  </TableCell>
                </tr>
              ) : (
                data.map((cat, catIndex) => (
                  <React.Fragment key={catIndex}>
                    {cat.items.map((row, rowIndex) => (
                      <TimesheetRow
                        key={rowIndex}
                        row={row}
                        rowIndex={rowIndex}
                        catIndex={catIndex}
                        days={days}
                        isSelectionMode={isSelectionMode}
                        isDaySelected={isDaySelected}
                        handleDaySelectionChange={handleDaySelectionChange}
                        supervisedProjectIds={supervisedProjectIds}
                      />
                    ))}
                  </React.Fragment>
                ))
              )}
              {data.length > 0 && (
                <TimesheetTotalRow days={days} calcColTotal={calcColTotal} calcGrandTotal={calcGrandTotal} />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default EmployeeTimesheetCalendar;