import React from 'react';
import { TableRow, TableCell, Checkbox, Tooltip } from '@mui/material';
import { EditNote as EditNoteIcon } from '@mui/icons-material';
import { TimesheetStatus } from '@tms/shared';

interface TimesheetRowProps {
  row: any;
  rowIndex: number;
  catIndex: number;
  days: { day: string; date: Date }[];
  isSelectionMode: boolean;
  isDaySelected: (catIndex: number, rowIndex: number, colIndex: number) => boolean;
  handleDaySelectionChange: (catIndex: number, rowIndex: number, colIndex: number, checked: boolean) => void;
  supervisedProjectIds: string[];
  supervisedTeamIds: string[];
}

const TimesheetRow: React.FC<TimesheetRowProps> = ({
  row,
  rowIndex,
  catIndex,
  days,
  isSelectionMode,
  isDaySelected,
  handleDaySelectionChange,
  supervisedProjectIds,
  supervisedTeamIds,
}) => (
  <TableRow>
    <TableCell />
    <TableCell>{row.work}</TableCell>
    {row.hours.map((hour: string, colIndex: number) => {
      const dailyStatus = row.dailyStatus?.[colIndex] || TimesheetStatus.Draft;
      const isSelected = isDaySelected(catIndex, rowIndex, colIndex);
      const hasHours = parseFloat(hour) > 0;
      const isDisabled = dailyStatus === TimesheetStatus.Approved || dailyStatus === TimesheetStatus.Rejected;
      
      // Authorization logic: Supervisors can only approve specific types of timesheets
      let canApprove = false;
      let tooltipMessage = '';
      
      if (row.projectId) {
        // Project timesheet - only project supervisors can approve
        canApprove = supervisedProjectIds.includes(row.projectId);
        tooltipMessage = 'You can only approve projects you supervise';
      } else if (row.teamId) {
        // Team timesheet - only team supervisors can approve
        canApprove = supervisedTeamIds.includes(row.teamId);
        tooltipMessage = 'You can only approve teams you supervise';
      } else {
        // Items with neither projectId nor teamId (like absence) - allow if user has any supervision
        canApprove = supervisedProjectIds.length > 0 || supervisedTeamIds.length > 0;
        tooltipMessage = 'You need supervision permissions to approve this item';
      }
      
      const isCheckboxDisabled = isDisabled || !canApprove;
      return (
        <TableCell key={colIndex} align="center">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isDisabled ? 0.6 : (!canApprove ? 0.4 : 1), position: 'relative' }}>
              <div style={{ marginRight: 4 }}>{hour}</div>
              {row.descriptions[colIndex] && (
                <Tooltip title={row.descriptions[colIndex]}>
                  <EditNoteIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </Tooltip>
              )}
            </div>
            {hasHours && dailyStatus !== TimesheetStatus.Draft && (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dailyStatus === TimesheetStatus.Approved ? '#4caf50' : dailyStatus === TimesheetStatus.Rejected ? '#f44336' : dailyStatus === TimesheetStatus.Pending ? '#ff9800' : '#9e9e9e' }} />
            )}
          </div>
        </TableCell>
      );
    })}
    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
      {row.hours.reduce((sum: number, h: string) => sum + parseFloat(h || '0'), 0).toFixed(2)}
    </TableCell>
  </TableRow>
);

export default TimesheetRow;
