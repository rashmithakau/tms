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
}) => (
  <TableRow>
    <TableCell>{row.work}</TableCell>
    {row.hours.map((hour: string, colIndex: number) => {
      const dailyStatus = row.dailyStatus?.[colIndex] || TimesheetStatus.Draft;
      const isSelected = isDaySelected(catIndex, rowIndex, colIndex);
      const hasHours = parseFloat(hour) > 0;
      const isDisabled = dailyStatus === TimesheetStatus.Approved || dailyStatus === TimesheetStatus.Rejected;
      const canApprove = row.projectId ? supervisedProjectIds.includes(row.projectId) : true;
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
                title={!canApprove ? 'You can only approve projects you supervise' : undefined}
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
