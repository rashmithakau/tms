import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { EditNote as EditNoteIcon } from '@mui/icons-material';
import theme from '../../styles/theme';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import { startOfWeek, addDays, format, isSameWeek } from 'date-fns';
import { listMyTimesheets, Timesheet } from '../../api/timesheet';
import { listProjects } from '../../api/project';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setTimesheetData, setWeekStartDate } from '../../store/slices/timesheetSlice';


// --- Get current week dynamically ---
const getCurrentWeek = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
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
}

export interface TimesheetData {
  category: 'Project' | 'Absence';
  items: TimesheetItem[];
}

const TimeSheetTableCalendar: React.FC = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState<TimesheetData[]>([]);
  const [editCell, setEditCell] = useState<{ cat: number; row: number; col: number } | null>(null);
  const [editDescription, setEditDescription] = useState<{ cat: number; row: number; col: number } | null>(null);

  const days = getCurrentWeek();
  const selectedActivities = useSelector(
    (state: RootState) => state.timesheet.selectedActivities
  );

  // --- Build absence rows whenever Redux updates ---
  const absenceRows: TimesheetItem[] = selectedActivities.map((activity: string) => ({
    work: activity,
    hours: Array(7).fill('00.00'),
    descriptions: Array(7).fill(''),
  }));

  useEffect(() => {
    dispatch(setTimesheetData(data));
    dispatch(setWeekStartDate(String(days[0].date)));
  }, [data, dispatch]);

  // --- Fetch projects + timesheet ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsResponse = await listProjects();
        const fetchedProjects = projectsResponse.data || [];

        // Build project rows
        const projectRows: TimesheetItem[] = fetchedProjects.map((project: any) => ({
          work: project.projectName,
          projectId: project._id,
          hours: Array(7).fill('00.00'),
          descriptions: Array(7).fill(''),
        }));

        // Fetch existing timesheet for current week
        const timesheetsResponse = await listMyTimesheets();
        const currentWeekStart = days[0].date;

        const existing = timesheetsResponse.data?.find((ts: Timesheet) =>
          isSameWeek(new Date(ts.weekStartDate), currentWeekStart, { weekStartsOn: 1 })
        );

        if (existing) {
          setData(existing.categories);
        } else {
          setData([
            { category: 'Project', items: projectRows },
            { category: 'Absence', items: absenceRows },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [selectedActivities]);

  // --- Hours edit ---
  const handleCellClick = (catIndex: number, rowIndex: number, colIndex: number) => {
    setEditCell({ cat: catIndex, row: rowIndex, col: colIndex });
  };

  const handleCellChange = (catIndex: number, rowIndex: number, colIndex: number, value: string) => {
    if (value && !/^\d{0,2}(\.\d{0,2})?$/.test(value)) return;

    setData((prev) => {
      const newData = structuredClone(prev); // ✅ deep copy so it's mutable
      newData[catIndex].items[rowIndex].hours[colIndex] = value;
      return newData;
    });
  };

  // --- Description edit ---
  const handleDescriptionClick = (catIndex: number, rowIndex: number, colIndex: number) => {
    setEditDescription({ cat: catIndex, row: rowIndex, col: colIndex });
  };

  const handleDescriptionChange = (catIndex: number, rowIndex: number, colIndex: number, value: string) => {
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
      .reduce((sum, row) => sum + row.hours.reduce((s, h) => s + parseFloat(h || '0'), 0), 0)
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
                <TableCell key={day.day} align="center" sx={{ fontWeight: 'bold' }}>
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
                  <TableRow key={rowIndex} hover>
                    <TableCell sx={{ fontWeight: rowIndex === 0 ? 'bold' : 'normal' }}>
                      {rowIndex === 0 ? cat.category : ''}
                    </TableCell>
                    <TableCell>{row.work}</TableCell>
                    {row.hours.map((hour: string, colIndex: number) => (
                      <TableCell key={colIndex} align="center">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {editCell &&
                          editCell.cat === catIndex &&
                          editCell.row === rowIndex &&
                          editCell.col === colIndex ? (
                            <BaseTextField
                              value={hour}
                              variant="standard"
                              onChange={(e) =>
                                handleCellChange(catIndex, rowIndex, colIndex, e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditCell(null);
                              }}
                              autoFocus
                              sx={{ width: 50 }}
                              placeholder="00.00"
                            />
                          ) : (
                            <div
                              onClick={() => handleCellClick(catIndex, rowIndex, colIndex)}
                              style={{ cursor: 'pointer', marginRight: 4 }}
                            >
                              {hour}
                            </div>
                          )}

                          <Tooltip title={row.descriptions[colIndex] || 'Add description'}>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDescriptionClick(catIndex, rowIndex, colIndex)
                              }
                            >
                              <EditNoteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </div>

                        {editDescription &&
                          editDescription.cat === catIndex &&
                          editDescription.row === rowIndex &&
                          editDescription.col === colIndex && (
                            <div style={{ marginTop: 4 }}>
                              <BaseTextField
                                value={row.descriptions[colIndex]}
                                variant="outlined"
                                size="small"
                                sx={{ width: '200px' }}
                                placeholder="Enter description"
                                onChange={(e) =>
                                  handleDescriptionChange(
                                    catIndex,
                                    rowIndex,
                                    colIndex,
                                    e.target.value
                                  )
                                }
                                onBlur={() => setEditDescription(null)}
                                autoFocus
                              />
                            </div>
                          )}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {calcRowTotal(row.hours)}
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}

            {/* Total Row */}
            <TableRow>
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
    </Box>
  );
};

export default TimeSheetTableCalendar;
