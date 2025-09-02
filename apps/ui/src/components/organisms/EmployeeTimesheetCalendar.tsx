import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Tooltip,
  Box,
  InputBase,
  Popover,
  Typography,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import { EditNote as EditNoteIcon } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import theme from '../../styles/theme';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { Timesheet } from '../../api/timesheet';
import { listProjects } from '../../api/project';
import { TimeSheetRow } from '../../types/timesheet';
import { TimesheetStatus } from '@tms/shared';
import DayCheckbox from '../atoms/DayCheckbox';

const buildWeekFrom = (startDate: Date) => {
  const start = startOfWeek(startDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }).map((_, i) => ({
    day: format(addDays(start, i), 'EEE dd'),
    date: addDays(start, i),
  }));
};

export interface TimesheetItem {
  work?: string;
  projectId?: string;
  hours: string[];
  descriptions: string[];
  dailyStatus?: TimesheetStatus[]; // Add daily status tracking
}

export interface TimesheetData {
  category: 'Project' | 'Absence';
  items: TimesheetItem[];
}

export interface DaySelection {
  timesheetId: string;
  categoryIndex: number;
  itemIndex: number;
  dayIndex: number;
}

interface EmployeeTimesheetCalendarProps {
  employeeId: string;
  employeeName: string;
  timesheets: TimeSheetRow[];
  originalTimesheets?: any[]; // Add original timesheet data
  supervisedProjectIds?: string[]; // Add supervised project IDs for authorization
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
  const [data, setData] = useState<TimesheetData[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    // Calculate Monday of current week using UTC (same logic as MyTimesheetsWindow)
    const now = new Date();
    const utcDay = now.getUTCDay(); // 0=Sun..6=Sat
    const diffToMonday = (utcDay + 6) % 7;
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diffToMonday));
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [projects, setProjects] = useState<any[]>([]);

  const days = useMemo(() => buildWeekFrom(currentWeekStart), [currentWeekStart]);

  // Get original timesheet for current week
  const weekOriginalTimesheet = useMemo(() => {
    if (!originalTimesheets || originalTimesheets.length === 0) return null;
    
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    return originalTimesheets.find(ts => {
      const tsDate = new Date(ts.weekStartDate);
      return tsDate >= currentWeekStart && tsDate < weekEnd;
    });
  }, [originalTimesheets, currentWeekStart]);

  // Get timesheets for current week
  const weekTimesheets = useMemo(() => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    return timesheets.filter(ts => {
      const tsDate = new Date(ts.date);
      return tsDate >= currentWeekStart && tsDate < weekEnd;
    });
  }, [timesheets, currentWeekStart]);

  // Initialize projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const resp = await listProjects();
        setProjects(resp.data?.projects || []);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, []);

  // Transform timesheets into calendar format
  useEffect(() => {
    if (projects.length === 0) return;

    const transformedData: TimesheetData[] = [];
    
    // Group timesheets by project and work type
    const projectMap = new Map<string, TimesheetItem>();
    const absenceMap = new Map<string, TimesheetItem>();

    // Initialize with all projects
    projects.forEach(project => {
      projectMap.set(project._id, {
        work: project.projectName,
        projectId: project._id,
        hours: Array(7).fill('0.00'),
        descriptions: Array(7).fill(''),
        dailyStatus: Array(7).fill(TimesheetStatus.Draft), // Initialize daily status
      });
    });

    // Fill in data from timesheets
    weekTimesheets.forEach(ts => {
      const dayIndex = days.findIndex(day => 
        isSameDay(day.date, new Date(ts.date))
      );
      
      if (dayIndex >= 0) {
        if (ts.projectId && projectMap.has(ts.projectId)) {
          const item = projectMap.get(ts.projectId)!;
          item.hours[dayIndex] = (ts.hoursSpent || 0).toFixed(2);
          item.descriptions[dayIndex] = ts.description || '';
          // Set daily status from timesheet data if available
          if (ts.dailyStatus && ts.dailyStatus[dayIndex]) {
            item.dailyStatus![dayIndex] = ts.dailyStatus[dayIndex];
          }
        } else if (ts.task) {
          // Handle absence/work type
          if (!absenceMap.has(ts.task)) {
            absenceMap.set(ts.task, {
              work: ts.task,
              hours: Array(7).fill('0.00'),
              descriptions: Array(7).fill(''),
              dailyStatus: Array(7).fill(TimesheetStatus.Draft),
            });
          }
          const item = absenceMap.get(ts.task)!;
          item.hours[dayIndex] = (ts.hoursSpent || 0).toFixed(2);
          item.descriptions[dayIndex] = ts.description || '';
          // Set daily status from timesheet data if available
          if (ts.dailyStatus && ts.dailyStatus[dayIndex]) {
            item.dailyStatus![dayIndex] = ts.dailyStatus[dayIndex];
          }
        }
      }
    });

    // Only include projects that have hours
    const projectItems = Array.from(projectMap.values()).filter(item =>
      item.hours.some(hour => parseFloat(hour) > 0)
    );

    const absenceItems = Array.from(absenceMap.values());

    if (projectItems.length > 0) {
      transformedData.push({ category: 'Project', items: projectItems });
    }
    if (absenceItems.length > 0) {
      transformedData.push({ category: 'Absence', items: absenceItems });
    }

    setData(transformedData);
  }, [weekTimesheets, projects, days]);

  // Navigation handlers
  const handlePreviousWeek = () => {
    const previousWeek = new Date(currentWeekStart);
    previousWeek.setUTCDate(previousWeek.getUTCDate() - 7);
    setCurrentWeekStart(previousWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  // Day selection handlers
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

    // Use the actual timesheet ID from the original timesheet for this week
    const actualTimesheetId = weekOriginalTimesheet?._id;
    
    if (!actualTimesheetId) {
      console.error('No timesheet ID found for current week');
      return;
    }

    const selectionKey = { 
      timesheetId: actualTimesheetId,
      categoryIndex, 
      itemIndex, 
      dayIndex 
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

  // Calculations
  const calcRowTotal = (hours: string[]) =>
    hours.reduce((sum, h) => sum + parseFloat(h || '0'), 0).toFixed(2);

  const calcColTotal = (colIndex: number) =>
    data
      .flatMap((cat) => cat.items)
      .reduce((sum, row) => sum + parseFloat(row.hours[colIndex] || '0'), 0)
      .toFixed(2);

  const calcGrandTotal = () =>
    data
      .flatMap((cat) => cat.items)
      .reduce(
        (sum, row) => sum + row.hours.reduce((s, h) => s + parseFloat(h || '0'), 0),
        0
      )
      .toFixed(2);

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
        borderRadius: 1
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
              timeZone: 'UTC'
            })}
            &nbsp;to&nbsp;
            {weekEndDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              timeZone: 'UTC'
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
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.background.paper }}>
                <TableCell />
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Work/Project
                </TableCell>
                {days.map((day) => (
                  <TableCell
                    key={day.day}
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: isSameDay(day.date, new Date())
                        ? theme.palette.action.hover
                        : 'inherit',
                    }}
                  >
                    {day.day}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Total
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No timesheet data for this week
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((cat, catIndex) => (
                  <React.Fragment key={catIndex}>
                    {cat.items.map((row: TimesheetItem, rowIndex: number) => (
                      <TableRow key={rowIndex}>
                        {rowIndex === 0 && (
                          <TableCell
                            rowSpan={cat.items.length}
                            sx={{ fontWeight: 'bold', verticalAlign: 'middle' }}
                          >
                            {cat.category}
                          </TableCell>
                        )}
                        <TableCell>{row.work}</TableCell>
                        {row.hours.map((hour: string, colIndex: number) => {
                          const dailyStatus = row.dailyStatus?.[colIndex] || TimesheetStatus.Draft;
                          const isSelected = isDaySelected(catIndex, rowIndex, colIndex);
                          const hasHours = parseFloat(hour) > 0;
                          const isDisabled = dailyStatus === TimesheetStatus.Approved || dailyStatus === TimesheetStatus.Rejected;
                          
                          // Check if the supervisor can approve this item
                          const canApprove = (() => {
                            // If it's a project item, check if supervisor supervises this project
                            if (row.projectId) {
                              return supervisedProjectIds.includes(row.projectId);
                            }
                            // For absence items (no projectId), supervisor can approve
                            return true;
                          })();
                          
                          const isCheckboxDisabled = isDisabled || !canApprove;
                          
                          return (
                            <TableCell key={colIndex} align="center">
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '4px'
                              }}>
                                {isSelectionMode && hasHours && (
                                  <Checkbox
                                    size="small"
                                    checked={isSelected}
                                    disabled={isCheckboxDisabled}
                                    onChange={(e) => handleDaySelectionChange(catIndex, rowIndex, colIndex, e.target.checked)}
                                    sx={{ p: 0, mb: 0.5 }}
                                    title={!canApprove ? 'You can only approve projects you supervise' : undefined}
                                  />
                                )}
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  opacity: isDisabled ? 0.6 : (!canApprove ? 0.4 : 1),
                                  position: 'relative'
                                }}>
                                  <div style={{ marginRight: 4 }}>
                                    {hour}
                                  </div>
                                  {row.descriptions[colIndex] && (
                                    <Tooltip title={row.descriptions[colIndex]}>
                                      <EditNoteIcon 
                                        fontSize="small" 
                                        sx={{ color: 'text.secondary' }} 
                                      />
                                    </Tooltip>
                                  )}
                                </div>
                                {/* Status indicator */}
                                {hasHours && dailyStatus !== TimesheetStatus.Draft && (
                                  <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: 
                                      dailyStatus === TimesheetStatus.Approved ? '#4caf50' :
                                      dailyStatus === TimesheetStatus.Rejected ? '#f44336' :
                                      dailyStatus === TimesheetStatus.Pending ? '#ff9800' : '#9e9e9e'
                                  }} />
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                          {calcRowTotal(row.hours)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))
              )}

              {data.length > 0 && (
                /* Total Row */
                <TableRow sx={{ backgroundColor: theme.palette.grey[200] }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell />
                  {days.map((_, colIndex) => (
                    <TableCell key={colIndex} align="center" sx={{ fontWeight: 'bold' }}>
                      {calcColTotal(colIndex)}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {calcGrandTotal()}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default EmployeeTimesheetCalendar;