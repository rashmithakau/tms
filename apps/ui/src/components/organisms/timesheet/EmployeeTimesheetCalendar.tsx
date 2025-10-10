import React from 'react';
import { Table, TableBody, TableContainer, Box, IconButton, Typography, TableCell, TableRow, Button } from '@mui/material';
import PageLoading from '../../molecules/common/loading/PageLoading';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import theme from '../../../styles/theme';
import { TimesheetStatus } from '@tms/shared';
import TimesheetTableHeader from '../../molecules/timesheet/TimesheetTableHeader';
import TimesheetRow from '../../molecules/timesheet/TimesheetRow';
import TimesheetTotalRow from '../../molecules/timesheet/TimesheetTotalRow';
import StatusDot from '../../atoms/common/StatusDot';
import { useEmployeeTimesheetCalendar } from '../../../hooks/timesheet/useEmployeeTimesheetCalendar';
import { IEmployeeTimesheetCalendarProps } from '../../../interfaces/organisms/timesheet';
import { DaySelection } from 'apps/ui/src/interfaces';

const EmployeeTimesheetCalendar: React.FC<IEmployeeTimesheetCalendarProps> = ({
  employeeName,
  timesheets,
  originalTimesheets = [],
  supervisedProjectIds = [],
  supervisedTeamIds = [],
  onDaySelectionChange,
  selectedDays = [],
  isSelectionMode = false,
  onApproveEditRequest,
  onRejectEditRequest,
  isApprovingEditRequest = false,
  isRejectingEditRequest = false,
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
  } = useEmployeeTimesheetCalendar({ timesheets, originalTimesheets, supervisedProjectIds, supervisedTeamIds });

  
  const getOriginalIndices = (renderCatIndex: number, renderItemIndex: number) => {
    if (!weekOriginalTimesheet) return null;

    const renderedCategory = data[renderCatIndex];
    if (!renderedCategory) return null;

    const originalCategoryIndex = weekOriginalTimesheet.data?.findIndex((c: any) => c.category === renderedCategory.category);
    if (originalCategoryIndex === undefined || originalCategoryIndex === -1) return null;

    const renderedItem = renderedCategory.items[renderItemIndex];
    if (!renderedItem) return null;

    const originalItems: any[] = weekOriginalTimesheet.data[originalCategoryIndex]?.items || [];

   
    const originalItemIndex = originalItems.findIndex((itm: any) => {
      if (renderedCategory.category === 'Project') {
        return itm.projectId && renderedItem.projectId && itm.projectId === renderedItem.projectId;
      }
      return itm.work && renderedItem.work && itm.work === renderedItem.work;
    });

    if (originalItemIndex === -1) return null;

    return { categoryIndex: originalCategoryIndex, itemIndex: originalItemIndex };
  };

 
  const isDaySelected = (categoryIndex: number, itemIndex: number, dayIndex: number) => {
    if (!isSelectionMode) return false;

    const mapped = getOriginalIndices(categoryIndex, itemIndex);
    if (!mapped) return false;

    return selectedDays.some(selection =>
      selection.categoryIndex === mapped.categoryIndex &&
      selection.itemIndex === mapped.itemIndex &&
      selection.dayIndex === dayIndex
    );
  };

  const handleDaySelectionChange = (categoryIndex: number, itemIndex: number, dayIndex: number, selected: boolean) => {
    if (!isSelectionMode || !onDaySelectionChange) return;
    const actualTimesheetId = weekOriginalTimesheet?._id;
    if (!actualTimesheetId) return;

    const mapped = getOriginalIndices(categoryIndex, itemIndex);
    if (!mapped) return;

    const selectionKey = {
      timesheetId: actualTimesheetId,
      categoryIndex: mapped.categoryIndex,
      itemIndex: mapped.itemIndex,
      dayIndex,
    };

    let newSelections: DaySelection[];
    if (selected) {
      newSelections = [...selectedDays, selectionKey];
    } else {
      newSelections = selectedDays.filter(selection =>
        !(
          selection.categoryIndex === mapped.categoryIndex &&
          selection.itemIndex === mapped.itemIndex &&
          selection.dayIndex === dayIndex
        )
      );
    }
    onDaySelectionChange(newSelections);
  };


  const formatTotal = (value: number): string => {
    return value.toFixed(2).padStart(5, '0');
  };

  const calcColTotal = (colIndex: number) => {
    const total = data.flatMap(cat => cat.items).reduce((sum, row) => sum + parseFloat(row.hours[colIndex] || '0'), 0);
    return formatTotal(total);
  };

  const calcGrandTotal = () => {
    const total = data.flatMap(cat => cat.items).reduce((sum, row) => sum + row.hours.reduce((s, h) => s + parseFloat(h || '0'), 0), 0);
    return formatTotal(total);
  };

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

      {/* Show Approve/Reject Edit Request buttons if timesheet is EditRequested */}
      {weekOriginalTimesheet?.status === TimesheetStatus.EditRequested && (onApproveEditRequest || onRejectEditRequest) && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: theme.palette.background.default, borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
              Employee has requested permission to edit this timesheet
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onApproveEditRequest && (
                <Button
                  variant="text"
                  startIcon={<ThumbUpAltOutlinedIcon />}
                  onClick={() => onApproveEditRequest(weekOriginalTimesheet._id)}
                  disabled={isApprovingEditRequest || isRejectingEditRequest}
                  sx={{ 
                    textTransform: 'none',
                  }}
                >
                  {isApprovingEditRequest ? 'Approving...' : 'Approve'}
                </Button>
              )}
              {onRejectEditRequest && (
                <Button
                  variant="text"
                  startIcon={<ThumbDownAltOutlinedIcon />}
                  onClick={() => onRejectEditRequest(weekOriginalTimesheet._id)}
                  disabled={isApprovingEditRequest || isRejectingEditRequest}
                  sx={{ 
                    textTransform: 'none',
                  }}
                >
                  {isRejectingEditRequest ? 'Rejecting...' : 'Reject'}
                </Button>
              )}
            </Box>
          </Box>
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

          <TableContainer>
            <Table size="small">
              <TimesheetTableHeader days={days} />
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="left" sx={{ py: 4, textAlign: 'left' }}>
                    <Typography color="textSecondary">No timesheet data for this week</Typography>
                  </TableCell>
                </TableRow>
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
                        supervisedTeamIds={supervisedTeamIds}
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
        </>
      )}
    </Box>
  );
};

export default EmployeeTimesheetCalendar;