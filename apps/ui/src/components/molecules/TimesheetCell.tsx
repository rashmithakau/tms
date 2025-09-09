import React from 'react';
import { Checkbox, Tooltip } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { TimesheetStatus } from '@tms/shared';

interface TimesheetCellProps {
  hour: string;
  description: string;
  dailyStatus: TimesheetStatus;
  isSelected: boolean;
  isSelectionMode: boolean;
  isCheckboxDisabled: boolean;
  hasHours: boolean;
  onCheckboxChange: (checked: boolean) => void;
  canApprove: boolean;
}

const TimesheetCell: React.FC<TimesheetCellProps> = ({
  hour,
  description,
  dailyStatus,
  isSelected,
  isSelectionMode,
  isCheckboxDisabled,
  hasHours,
  onCheckboxChange,
  canApprove,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px' }}>
    {isSelectionMode && hasHours && (
      <Checkbox
        size="small"
        checked={isSelected}
        disabled={isCheckboxDisabled}
        onChange={e => onCheckboxChange(e.target.checked)}
        sx={{ p: 0, mb: 0.5 }}
        title={!canApprove ? 'You can only approve projects you supervise' : undefined}
      />
    )}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isCheckboxDisabled ? 0.6 : (!canApprove ? 0.4 : 1), position: 'relative' }}>
      <div style={{ marginRight: 4 }}>{hour}</div>
      {description && (
        <Tooltip title={description}>
          <EditNoteIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </Tooltip>
      )}
    </div>
    {hasHours && dailyStatus !== TimesheetStatus.Draft && (
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor:
          dailyStatus === TimesheetStatus.Approved ? '#4caf50' :
          dailyStatus === TimesheetStatus.Rejected ? '#f44336' :
          dailyStatus === TimesheetStatus.Pending ? '#ff9800' : '#9e9e9e',
      }} />
    )}
  </div>
);

export default TimesheetCell;
