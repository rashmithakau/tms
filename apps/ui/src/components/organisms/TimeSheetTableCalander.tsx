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
} from '@mui/material';
import { EditNote as EditNoteIcon } from '@mui/icons-material';
import theme from '../../styles/theme';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { getOrCreateMyTimesheetForWeek, Timesheet } from '../../api/timesheet';
import { listProjects } from '../../api/project';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { TimesheetStatus } from '@tms/shared';
import {
  setTimesheetData,
  setWeekStartDate,
  setCurrentTimesheetId,
  setTimesheetStatus,
  setOriginalDataHash,
} from '../../store/slices/timesheetSlice';

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

const TimeSheetTableCalendar: React.FC = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState<TimesheetData[]>([]);
  const [editCell, setEditCell] = useState<{ cat: number; row: number; col: number } | null>(null);

  const [editDescription, setEditDescription] = useState<{
    cat: number;
    row: number;
    col: number;
  } | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const selectedWeekStartIso = useSelector((state: RootState) => state.timesheet.weekStartDate);
  const selectedWeekStart = useMemo(() => selectedWeekStartIso ? new Date(selectedWeekStartIso) : startOfWeek(new Date(), { weekStartsOn: 1 }), [selectedWeekStartIso]);
  const days = useMemo(() => buildWeekFrom(selectedWeekStart), [selectedWeekStart]);
  const timesheetStatus = useSelector((state: RootState) => state.timesheet.status);
  const selectedActivities = useSelector(
    (state: RootState) => state.timesheet.selectedActivities
  );

  const absenceRows: TimesheetItem[] = selectedActivities.map(
    (activity: string) => ({
      work: activity,
      hours: Array(7).fill('00.00'),
      descriptions: Array(7).fill(''),
      dailyStatus: Array(7).fill(TimesheetStatus.Draft), // Initialize daily status
    })
  );

  useEffect(() => {
    dispatch(setTimesheetData(data));
  }, [data, dispatch]);

  useEffect(() => {
    // Only set weekStartDate if not already set to prevent infinite loop
    if (!selectedWeekStartIso) {
      const weekStart = days[0].date.toISOString().slice(0, 10);
      dispatch(setWeekStartDate(weekStart));
    }
    // Optionally, set weekEndDate similarly if needed
  }, [dispatch, days, selectedWeekStartIso]);

  // --- Fetch projects + timesheet ---
  useEffect(() => {
    if (!selectedWeekStartIso) return;
    const fetchData = async () => {
      try {
        const projectsResponse = await listProjects();
        const fetchedProjects = (projectsResponse.data as any)?.projects || [];

        // Build project rows
        const projectRows: TimesheetItem[] = fetchedProjects.map((project: any) => ({
          work: project.projectName,
          projectId: project._id,
          hours: Array(7).fill('00.00'),
          descriptions: Array(7).fill(''),
          dailyStatus: Array(7).fill(TimesheetStatus.Draft), // Initialize daily status
        }));

        // Fetch or create timesheet for current week
        const resp = await getOrCreateMyTimesheetForWeek(selectedWeekStartIso);
        const existing: Timesheet | undefined = (resp.data as any).timesheet;
        if (existing) {
          dispatch(setCurrentTimesheetId(existing._id));
          dispatch(setTimesheetStatus(existing.status as any));
          const existingData: any[] = (existing as any).data || [];
          // ensure Absence category includes newly selected activities (if Draft)
          let nextData = existingData;
          if ((existing.status as any) === 'Draft') {
            // Merge in missing Project rows
            const projectCatIndex = nextData.findIndex((c) => c.category === 'Project');
            if (projectCatIndex >= 0) {
              const presentProjectIds = new Set(
                (nextData[projectCatIndex].items || []).map((it: any) => it.projectId)
              );
              const newProjectItems = projectRows.filter(
                (row) => row.projectId && !presentProjectIds.has(row.projectId)
              );
              if (newProjectItems.length > 0) {
                nextData = nextData.map((c, i) =>
                  i === projectCatIndex ? { ...c, items: [...c.items, ...newProjectItems] } : c
                );
              }
            } else if (projectRows.length > 0) {
              nextData = [{ category: 'Project', items: projectRows }, ...nextData];
            }
            const absenceCatIndex = nextData.findIndex((c) => c.category === 'Absence');
            if (absenceCatIndex >= 0) {
              const presentWorks = new Set(
                (nextData[absenceCatIndex].items || []).map((it: any) => it.work)
              );
              const newItems = absenceRows.filter((row) => row.work && !presentWorks.has(row.work));
              if (newItems.length > 0) {
                nextData = nextData.map((c, i) =>
                  i === absenceCatIndex ? { ...c, items: [...c.items, ...newItems] } : c
                );
              }
            } else if (absenceRows.length > 0) {
              nextData = [...nextData, { category: 'Absence', items: absenceRows }];
            }
          }
          setData(nextData);
          dispatch(setOriginalDataHash(JSON.stringify(nextData)));
        } else {
          setData([
            { category: 'Project', items: projectRows },
            { category: 'Absence', items: absenceRows },
          ]);
          const initial = [
            { category: 'Project', items: projectRows },
            { category: 'Absence', items: absenceRows },
          ];
          dispatch(setOriginalDataHash(JSON.stringify(initial)));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [selectedActivities, selectedWeekStartIso, dispatch]);

  // --- Hours edit ---
  const handleCellClick = (catIndex: number, rowIndex: number, colIndex: number) => {
    // Allow editing only for Draft and Rejected status
    if (timesheetStatus && !['Draft', 'Rejected'].includes(timesheetStatus)) return;
    
    // If status is Rejected, only allow editing rejected days
    if (timesheetStatus === 'Rejected') {
      const item = data[catIndex]?.items[rowIndex];
      const dayStatus = item?.dailyStatus?.[colIndex];
      if (dayStatus !== TimesheetStatus.Rejected) return; // Only allow editing rejected days
    }
    
    setEditCell({ cat: catIndex, row: rowIndex, col: colIndex });
  };

  const handleCellChange = (
    catIndex: number,
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    if (value && !/^\d{0,2}(\.\d{0,2})?$/.test(value)) return;

    setData((prev) => {
      const newData = structuredClone(prev);
      newData[catIndex].items[rowIndex].hours[colIndex] = value.trim() === '' ? '00.00' : value;
      return newData;
    });
  };

  // --- Description edit ---
  const handleDescriptionClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    catIndex: number,
    rowIndex: number,
    colIndex: number
  ) => {
    // Allow editing only for Draft and Rejected status
    if (timesheetStatus && !['Draft', 'Rejected'].includes(timesheetStatus)) return;
    
    // If status is Rejected, only allow editing rejected days
    if (timesheetStatus === 'Rejected') {
      const item = data[catIndex]?.items[rowIndex];
      const dayStatus = item?.dailyStatus?.[colIndex];
      if (dayStatus !== 'Rejected') return; // Only allow editing rejected days
    }
    
    setAnchorEl(e.currentTarget);
    setEditDescription({ cat: catIndex, row: rowIndex, col: colIndex });
  };

  const handleDescriptionChange = (
    catIndex: number,
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    setData((prev) => {
      const newData = structuredClone(prev);
      newData[catIndex].items[rowIndex].descriptions[colIndex] = value;
      return newData;
    });
  };

  // --- Calculations ---
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

  return (
    <Box>
      <TableContainer>
        <Table>
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
            {data.map((cat, catIndex) => (
              <React.Fragment key={catIndex}>
                {cat.items.map((row: TimesheetItem, rowIndex: number) => (
                  <TableRow key={rowIndex} >
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
                      const dayStatus = row.dailyStatus?.[colIndex] || TimesheetStatus.Draft;
                      const isEditable = timesheetStatus === 'Draft' || 
                        (timesheetStatus === 'Rejected' && dayStatus === TimesheetStatus.Rejected);
                      
                      return (
                        <TableCell 
                          key={colIndex} 
                          align="center"
                        >
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',width:'80px'}}>
                              {editCell &&
                              editCell.cat === catIndex &&
                              editCell.row === rowIndex &&
                              editCell.col === colIndex ? (
                                <InputBase
                                  value={hour}
                                  onChange={(e) =>
                                    handleCellChange(catIndex, rowIndex, colIndex, e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') setEditCell(null);
                                  }}
                                  autoFocus
                                  sx={{
                                    width: 34,
                                    borderRadius: 1,
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    backgroundColor: '#fff',
                                  }}
                                  placeholder="00.00"
                                />
                              ) : (
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  gap: '4px'
                                }}>
                                  <div
                                    onClick={() => isEditable ? handleCellClick(catIndex, rowIndex, colIndex) : undefined}
                                    style={{ 
                                      cursor: isEditable ? 'pointer' : 'default', 
                                      opacity: isEditable ? 1 : 0.7
                                    }}
                                  >
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
                              )}

                              <Tooltip title={isEditable ? (row.descriptions[colIndex] || 'Add description') : 'Cannot edit approved/pending days'}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => isEditable ? handleDescriptionClick(e, catIndex, rowIndex, colIndex) : undefined}
                                  disabled={!isEditable}
                                >
                                 <EditNoteIcon 
                                  fontSize="small" 
                                  sx={{ 
                                    color: isEditable ? 'lightgray' : '#ccc',
                                    opacity: isEditable ? 1 : 0.5
                                  }} 
                                />
                                </IconButton>
                              </Tooltip>
                            </div>
                            
                            {/* Status indicator dot */}
                            {parseFloat(hour) > 0 && dayStatus !== TimesheetStatus.Draft && (
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 
                                  dayStatus === TimesheetStatus.Approved ? '#4caf50' :
                                  dayStatus === TimesheetStatus.Rejected ? '#f44336' :
                                  dayStatus === TimesheetStatus.Pending ? '#ff9800' : '#9e9e9e'
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
            ))}

            {/* Total Row */}
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
          </TableBody>
        </Table>
      </TableContainer>

      {/* Description Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {editDescription && (
          <InputBase
            value={
              data[editDescription.cat].items[editDescription.row].descriptions[editDescription.col]
            }
            placeholder="Enter description"
            onChange={(e) =>
              handleDescriptionChange(
                editDescription.cat,
                editDescription.row,
                editDescription.col,
                e.target.value
              )
            }
            autoFocus
            sx={{ p: 1, width: 250 }}
          />
        )}
      </Popover>
    </Box>
  );
};

export default TimeSheetTableCalendar;
