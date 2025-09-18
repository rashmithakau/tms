import React from 'react';
import { InputBase, IconButton, Tooltip } from '@mui/material';
import { EditNote as EditNoteIcon } from '@mui/icons-material';
import { TimesheetCellProps } from '../../../interfaces';
import { TimesheetStatus } from '@tms/shared';

const TimesheetCell: React.FC<TimesheetCellProps> = ({
  hour,
  description,
  dayStatus,
  isEditing,
  isEditable,
  onCellClick,
  onCellChange,
  onCellKeyDown,
  onDescriptionClick,
}) => {
  const getStatusColor = (status: TimesheetStatus): string => {
    switch (status) {
      case TimesheetStatus.Approved:
        return '#4caf50';
      case TimesheetStatus.Rejected:
        return '#f44336';
      case TimesheetStatus.Pending:
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {/* Hour input/display with description icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          {/* Hour input/display */}
          {isEditing ? (
            <InputBase
              value={hour}
              onChange={(e) => onCellChange(e.target.value)}
              onKeyDown={onCellKeyDown}
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
            <div
              onClick={() => (isEditable ? onCellClick() : undefined)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                opacity: isEditable ? 1 : 0.7,
              }}
            >
              {hour}
            </div>
          )}

          {/* Description icon */}
          {isEditable ? (
            <Tooltip title={description || 'Add description'}>
              <IconButton
                size="small"
                onClick={onDescriptionClick}
                disabled={!isEditable}
              >
                <EditNoteIcon
                  fontSize="small"
                  sx={{
                    color: 'lightgray',
                    opacity: 1,
                  }}
                />
              </IconButton>
            </Tooltip>
          ) : (
            description && (
              <Tooltip title={description}>
                <EditNoteIcon
                  fontSize="small"
                  sx={{ color: 'text.secondary' }}
                />
              </Tooltip>
            )
          )}
        </div>
      </div>

      {/* Status indicator dot */}
      {parseFloat(hour) > 0 && dayStatus !== TimesheetStatus.Draft && (
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(dayStatus),
          }}
        />
      )}
    </div>
  );
};

export default TimesheetCell;