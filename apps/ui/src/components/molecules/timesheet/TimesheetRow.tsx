import React from 'react';
import { TableRow, TableCell, Checkbox, Tooltip } from '@mui/material';
import { EditNote as EditNoteIcon } from '@mui/icons-material';
import { TimesheetStatus } from '@tms/shared';
import { ITimesheetRowProps } from '../../../interfaces/component/timesheet';

const TimesheetRow: React.FC<ITimesheetRowProps> = ({
  row,
  rowIndex,
  catIndex,
  days,
  isSelectionMode,
  isDaySelected,
  handleDaySelectionChange,
  handleBulkDaySelectionChange,
  supervisedProjectIds,
  supervisedTeamIds,
  supervisedUserIds = [],
  employeeId,
}) => {
  // Check if any day in this row can be approved by this supervisor
  const supervisesEmployee = employeeId ? supervisedUserIds.includes(employeeId) : false;
  
  let canApproveRow = false;
  if (row.projectId) {
    canApproveRow = supervisedProjectIds.includes(row.projectId);
  } else if (row.teamId) {
    const supervisesTeam = supervisedTeamIds.includes(row.teamId);
    canApproveRow = supervisesTeam || supervisesEmployee;
  } else {
    canApproveRow = true;
  }

  // Check which days have hours and can be selected
  const selectableDays = row.hours
    .map((hour: string, colIndex: number) => {
      const dailyStatus = row.dailyStatus?.[colIndex] || TimesheetStatus.Draft;
      const hasHours = parseFloat(hour) > 0;
      const isDisabled = dailyStatus === TimesheetStatus.Approved || dailyStatus === TimesheetStatus.Rejected;
      return { colIndex, hasHours, isDisabled, canSelect: hasHours && !isDisabled && canApproveRow };
    })
    .filter((day: { canSelect: boolean }) => day.canSelect);

  // Check if all selectable days are selected
  const allSelectableDaysSelected = selectableDays.length > 0 && 
    selectableDays.every((day: { colIndex: number }) => isDaySelected(catIndex, rowIndex, day.colIndex));
  
  // Check if some (but not all) selectable days are selected
  const someSelectableDaysSelected = selectableDays.some((day: { colIndex: number }) => isDaySelected(catIndex, rowIndex, day.colIndex)) && 
    !allSelectableDaysSelected;

  // Handle select all checkbox change
  const handleSelectAllChange = (checked: boolean) => {
    if (selectableDays.length === 0) return;
    
    // Use bulk handler if available, otherwise fall back to individual calls
    if (handleBulkDaySelectionChange) {
      const dayIndices = selectableDays.map((day: { colIndex: number }) => day.colIndex);
      handleBulkDaySelectionChange(catIndex, rowIndex, dayIndices, checked);
    } else {
      // Fallback to individual calls (will only apply the last one due to state management)
      selectableDays.forEach((day: { colIndex: number }) => {
        handleDaySelectionChange(catIndex, rowIndex, day.colIndex, checked);
      });
    }
  };

  return (
    <TableRow>
      <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle', width: '50px', minWidth: '50px' }}>
        {isSelectionMode && selectableDays.length > 0 && (
          <Checkbox
            size="small"
            checked={allSelectableDaysSelected}
            indeterminate={someSelectableDaysSelected}
            onChange={e => handleSelectAllChange(e.target.checked)}
            sx={{ p: 0 }}
            title="Select/Deselect all days for this task/project"
          />
        )}
      </TableCell>
      <TableCell sx={{ textAlign: 'left', paddingLeft: '16px', paddingRight: '16px', verticalAlign: 'middle', width: '200px', minWidth: '200px' }}>{row.work}</TableCell>
    {row.hours.map((hour: string, colIndex: number) => {
      const dailyStatus = row.dailyStatus?.[colIndex] || TimesheetStatus.Draft;
      const isSelected = isDaySelected(catIndex, rowIndex, colIndex);
      const hasHours = parseFloat(hour) > 0;
      const isDisabled = dailyStatus === TimesheetStatus.Approved || dailyStatus === TimesheetStatus.Rejected;
      
      
      let canApprove = false;
      let tooltipMessage = '';
      
      // Check if the supervisor can approve based on:
      // For projects: can approve if they supervise the project
      // For teams: can approve if they supervise the team
      // For other entries: can approve if they supervise the employee
      
      const supervisesEmployee = employeeId ? supervisedUserIds.includes(employeeId) : false;
      
      if (row.projectId) {
        // Project-based entry: can approve if supervises the project
        const supervisesProject = supervisedProjectIds.includes(row.projectId);
        canApprove = supervisesProject;
        
        if (!supervisesProject) {
          tooltipMessage = 'You do not supervise this project';
        }
      } else if (row.teamId) {
        // Team-based entry: can approve if supervises the team (department) OR the employee (non-department team)
        const supervisesTeam = supervisedTeamIds.includes(row.teamId);
        canApprove = supervisesTeam || supervisesEmployee;
        
        if (!supervisesTeam && !supervisesEmployee) {
          tooltipMessage = 'You do not supervise this team or employee';
        }
      } else {
        // Other entries (sick, vacation, etc.): any supervisor can approve
        canApprove = true;
      }
      
      const isCheckboxDisabled = isDisabled || !canApprove;
      return (
        <TableCell key={colIndex} align="left" sx={{ textAlign: 'left', paddingLeft: '16px', paddingRight: '16px', verticalAlign: 'middle', width: '120px', minWidth: '120px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', flexDirection: 'column', gap: '4px', width: '100%' }}>
            {isSelectionMode && hasHours && (
              <Checkbox
                size="small"
                checked={isSelected}
                disabled={isCheckboxDisabled}
                onChange={e => handleDaySelectionChange(catIndex, rowIndex, colIndex, e.target.checked)}
                sx={{ p: 0, mb: 0.5 }}
                title={!canApprove ? tooltipMessage : undefined}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', opacity: isDisabled ? 0.6 : (!canApprove ? 0.4 : 1), position: 'relative', width: '100%' }}>
              <div>{hour}</div>
              {row.descriptions[colIndex] && (
                <Tooltip title={row.descriptions[colIndex]}>
                  <EditNoteIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </Tooltip>
              )}
              {hasHours && dailyStatus !== TimesheetStatus.Draft && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dailyStatus === TimesheetStatus.Approved ? '#4caf50' : dailyStatus === TimesheetStatus.Rejected ? '#f44336' : dailyStatus === TimesheetStatus.Pending ? '#ff9800' : '#9e9e9e' }} />
              )}
            </div>
          </div>
        </TableCell>
      );
    })}
    <TableCell align="left" sx={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: '16px', paddingRight: '16px', verticalAlign: 'middle', width: '100px', minWidth: '100px' }}>
      {row.hours.reduce((sum: number, h: string) => sum + parseFloat(h || '0'), 0).toFixed(2).padStart(5, '0')}
    </TableCell>
  </TableRow>
);
};
export default TimesheetRow;
