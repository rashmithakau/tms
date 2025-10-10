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
  supervisedProjectIds,
  supervisedTeamIds,
  supervisedUserIds = [],
  employeeId,
}) => (
  <TableRow>
    <TableCell sx={{ textAlign: 'left', verticalAlign: 'middle', width: '50px', minWidth: '50px' }} />
    <TableCell sx={{ textAlign: 'left', paddingLeft: '16px', paddingRight: '16px', verticalAlign: 'middle', width: '200px', minWidth: '200px' }}>{row.work}</TableCell>
    {row.hours.map((hour: string, colIndex: number) => {
      const dailyStatus = row.dailyStatus?.[colIndex] || TimesheetStatus.Draft;
      const isSelected = isDaySelected(catIndex, rowIndex, colIndex);
      const hasHours = parseFloat(hour) > 0;
      const isDisabled = dailyStatus === TimesheetStatus.Approved || dailyStatus === TimesheetStatus.Rejected;
      
      
      let canApprove = false;
      let tooltipMessage = '';
      
      // Check if the supervisor can approve based on:
      // 1. They supervise the employee (through any team - department or not)
      // 2. AND either:
      //    a. It's a project entry and they supervise the project, OR
      //    b. It's a team entry and they supervise that specific team (must be a department), OR
      //    c. It's another type of entry and they have any supervision permissions
      
      const supervisesEmployee = employeeId ? supervisedUserIds.includes(employeeId) : false;
      
      if (row.projectId) {
        // Project-based entry: can approve if supervises the project AND supervises the employee
        canApprove = supervisedProjectIds.includes(row.projectId) || supervisesEmployee;
        tooltipMessage = 'You can only approve if you supervise the project or the employee';
      } else if (row.teamId) {
        // Team-based entry: can approve if supervises that specific department team AND supervises the employee
        canApprove = supervisedTeamIds.includes(row.teamId) || supervisesEmployee;
        tooltipMessage = 'You can only approve if you supervise this department or the employee';
      } else {
        // Other entries: can approve if supervises the employee
        canApprove = supervisesEmployee || supervisedProjectIds.length > 0 || supervisedTeamIds.length > 0;
        tooltipMessage = 'You need supervision permissions to approve this item';
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
      {row.hours.reduce((sum: number, h: string) => sum + parseFloat(h || '0'), 0).toFixed(2)}
    </TableCell>
  </TableRow>
);

export default TimesheetRow;
