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
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import { EditNote as EditNoteIcon, Save as SaveIcon, Send as SendIcon } from '@mui/icons-material';
import theme from '../../styles/theme';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import { startOfWeek, addDays, format, parseISO, isSameWeek } from 'date-fns';
import { createMyTimesheet, updateMyTimesheet, listMyTimesheets, Timesheet, TimesheetCategory, TimesheetItem } from '../../api/timesheet';
import { listProjects, ProjectListItem } from '../../api/project';
import { TimesheetStatus } from '@tms/shared';

// --- Get current week dynamically ---
const getCurrentWeek = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  return Array.from({ length: 7 }).map((_, i) => ({
    day: format(addDays(start, i), 'EEE dd'),
    date: addDays(start, i),
  }));
};

const TimeSheetTableCalendar: React.FC = () => {
  const [data, setData] = useState<TimesheetCategory[]>([
    {
      category: 'Project',
      items: [
        {
          work: '',
          projectId: '',
          hours: ['00.00', '00.00', '00.00', '00.00', '00.00', '00.00', '00.00'],
          descriptions: ['', '', '', '', '', '', ''],
        },
      ],
    },
    {
      category: 'Absence',
      items: [
        {
          work: 'Holiday',
          hours: ['00.00', '00.00', '00.00', '00.00', '00.00', '00.00', '00.00'],
          descriptions: ['', '', '', '', '', '', ''],
        },
        {
          work: 'Sick',
          hours: ['00.00', '00.00', '00.00', '00.00', '00.00', '00.00', '00.00'],
          descriptions: ['', '', '', '', '', '', ''],
        },
      ],
    },
  ]);

  const [editCell, setEditCell] = useState<{ cat: number; row: number; col: number } | null>(null);
  const [editDescription, setEditDescription] = useState<{ cat: number; row: number; col: number } | null>(null);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [existingTimesheet, setExistingTimesheet] = useState<Timesheet | null>(null);

  const days = getCurrentWeek();

  // Fetch projects and existing timesheet on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsResponse = await listProjects();
        setProjects(projectsResponse.data?.projects || []);

        // Fetch existing timesheet for current week
        const timesheetsResponse = await listMyTimesheets();
        const currentWeekStart = days[0].date;
        
        const existingTimesheet = timesheetsResponse.data?.find((ts: Timesheet) => 
          isSameWeek(new Date(ts.weekStartDate), currentWeekStart, { weekStartsOn: 1 })
        );

        if (existingTimesheet) {
          setExistingTimesheet(existingTimesheet);
          setData(existingTimesheet.categories);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setMessage({ type: 'error', text: 'Failed to load data. Please refresh the page.' });
      }
    };
    fetchData();
  }, []);

  // --- Hours edit ---
  const handleCellClick = (catIndex: number, rowIndex: number, colIndex: number) => {
    setEditCell({ cat: catIndex, row: rowIndex, col: colIndex });
  };

  const handleCellChange = (catIndex: number, rowIndex: number, colIndex: number, value: string) => {
    // Validate time format (HH.MM)
    if (value && !/^\d{1,2}\.\d{2}$/.test(value)) {
      return; // Invalid format, don't update
    }

    const newData = [...data];
    newData[catIndex].items[rowIndex].hours[colIndex] = value;
    setData(newData);
  };

  // --- Description edit ---
  const handleDescriptionClick = (catIndex: number, rowIndex: number, colIndex: number) => {
    setEditDescription({ cat: catIndex, row: rowIndex, col: colIndex });
  };

  const handleDescriptionChange = (catIndex: number, rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    newData[catIndex].items[rowIndex].descriptions[colIndex] = value;
    setData(newData);
  };

  // --- Project selection ---
  const handleProjectChange = (catIndex: number, rowIndex: number, projectId: string) => {
    const newData = [...data];
    newData[catIndex].items[rowIndex].projectId = projectId;
    const project = projects.find(p => p._id === projectId);
    if (project) {
      newData[catIndex].items[rowIndex].work = project.projectName;
    }
    setData(newData);
  };

  // --- Add new project row ---
  const addProjectRow = () => {
    const newData = [...data];
    newData[0].items.push({
      work: '',
      projectId: '',
      hours: ['00.00', '00.00', '00.00', '00.00', '00.00', '00.00', '00.00'],
      descriptions: ['', '', '', '', '', '', ''],
    });
    setData(newData);
  };

  // --- Remove project row ---
  const removeProjectRow = (rowIndex: number) => {
    if (data[0].items.length > 1) {
      const newData = [...data];
      newData[0].items.splice(rowIndex, 1);
      setData(newData);
    }
  };

  // --- Calculations ---
  const calcRowTotal = (hours: string[]) =>
    hours.reduce((sum, h) => sum + parseFloat(h || '0'), 0).toFixed(2);

  const calcColTotal = (colIndex: number) =>
    data
      .flatMap(cat => cat.items)
      .reduce((sum, row) => sum + parseFloat(row.hours[colIndex] || '0'), 0)
      .toFixed(2);

  const calcGrandTotal = () =>
    data
      .flatMap(cat => cat.items)
      .reduce(
        (sum, row) =>
          sum + row.hours.reduce((s, h) => s + parseFloat(h || '0'), 0),
        0
      )
      .toFixed(2);

  // --- Save timesheet ---
  const handleSave = async () => {
    // Validate that project rows have selected projects
    const projectRows = data[0].items;
    const hasEmptyProjects = projectRows.some(item => !item.projectId && item.hours.some(h => parseFloat(h || '0') > 0));
    
    if (hasEmptyProjects) {
      setMessage({ type: 'error', text: 'Please select projects for all rows with hours entered!' });
      return;
    }

    // Validate that at least one project has hours
    const hasProjectHours = projectRows.some(item => item.hours.some(h => parseFloat(h || '0') > 0));
    if (!hasProjectHours) {
      setMessage({ type: 'error', text: 'Please enter hours for at least one project!' });
      return;
    }

    setIsLoading(true);
    try {
      const weekStartDate = days[0].date;
      
      if (existingTimesheet) {
        await updateMyTimesheet(existingTimesheet._id, {
          weekStartDate,
          categories: data,
        });
        setMessage({ type: 'success', text: 'Timesheet updated successfully!' });
      } else {
        const result = await createMyTimesheet({
          weekStartDate,
          categories: data,
        });
        setExistingTimesheet(result.data);
        setMessage({ type: 'success', text: 'Timesheet saved successfully!' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save timesheet';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Submit timesheet ---
  const handleSubmit = async () => {
    if (!existingTimesheet) {
      setMessage({ type: 'error', text: 'Please save the timesheet first before submitting!' });
      return;
    }

    // Validate that project rows have selected projects
    const projectRows = data[0].items;
    const hasEmptyProjects = projectRows.some(item => !item.projectId && item.hours.some(h => parseFloat(h || '0') > 0));
    
    if (hasEmptyProjects) {
      setMessage({ type: 'error', text: 'Please select projects for all rows with hours entered!' });
      return;
    }

    // Validate that at least one project has hours
    const hasProjectHours = projectRows.some(item => item.hours.some(h => parseFloat(h || '0') > 0));
    if (!hasProjectHours) {
      setMessage({ type: 'error', text: 'Please enter hours for at least one project!' });
      return;
    }

    setIsLoading(true);
    try {
      await updateMyTimesheet(existingTimesheet._id, {
        status: TimesheetStatus.Pending,
      });
      setMessage({ type: 'success', text: 'Timesheet submitted successfully!' });
      setExistingTimesheet({ ...existingTimesheet, status: TimesheetStatus.Pending });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to submit timesheet';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {/* Action Buttons */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={addProjectRow}
          disabled={isLoading}
        >
          Add Project
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={isLoading}
        >
          Save
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          onClick={handleSubmit}
          disabled={isLoading || !existingTimesheet || existingTimesheet.status !== TimesheetStatus.Draft}
        >
          Submit
        </Button>
      </Box>

      {/* Status Display */}
      {existingTimesheet && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Status: <strong>{existingTimesheet.status}</strong>
            {existingTimesheet.status === TimesheetStatus.Draft && ' - You can still edit this timesheet'}
            {existingTimesheet.status === TimesheetStatus.Pending && ' - Waiting for approval'}
            {existingTimesheet.status === TimesheetStatus.Approved && ' - Approved'}
            {existingTimesheet.status === TimesheetStatus.Rejected && ' - Rejected'}
          </Typography>
        </Box>
      )}

      <TableContainer>
        <Table>
          {/* Header */}
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
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {data.map((cat, catIndex) => (
              <React.Fragment key={catIndex}>
                {cat.items.map((row: TimesheetItem, rowIndex: number) => (
                  <TableRow key={rowIndex} hover>
                    <TableCell sx={{ fontWeight: rowIndex === 0 ? 'bold' : 'normal' }}>
                      {rowIndex === 0 ? cat.category : ''}
                    </TableCell>
                    <TableCell>
                      {cat.category === 'Project' ? (
                        <FormControl fullWidth size="small">
                          <InputLabel>Select Project</InputLabel>
                          <Select
                            value={row.projectId || ''}
                            onChange={(e) => handleProjectChange(catIndex, rowIndex, e.target.value)}
                            label="Select Project"
                            error={!row.projectId && row.hours.some(h => parseFloat(h || '0') > 0)}
                          >
                            <MenuItem value="">
                              <em>Select a project</em>
                            </MenuItem>
                            {projects.map((project) => (
                              <MenuItem key={project._id} value={project._id}>
                                {project.projectName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        row.work
                      )}
                    </TableCell>
                    {row.hours.map((hour: string, colIndex: number) => (
                      <TableCell key={colIndex} align="center">
                        {/* Hours + Icon in same line */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
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
                              onBlur={() => setEditCell(null)}
                              autoFocus
                              sx={{ width: 38 }}
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

                          <Tooltip
                            title={row.descriptions[colIndex] || 'Add description'}
                          >
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

                        {/* Description below */}
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
                                  handleDescriptionChange(catIndex, rowIndex, colIndex, e.target.value)
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
                    <TableCell align="center">
                      {cat.category === 'Project' && data[0].items.length > 1 && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => removeProjectRow(rowIndex)}
                          disabled={isLoading}
                        >
                          Remove
                        </Button>
                      )}
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
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Message Snackbar */}
      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
      >
        <Alert
          onClose={() => setMessage(null)}
          severity={message?.type}
          sx={{ width: '100%' }}
        >
          {message?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TimeSheetTableCalendar;
