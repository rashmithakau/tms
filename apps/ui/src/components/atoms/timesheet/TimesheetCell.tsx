import React from 'react';
import { InputBase, IconButton, Tooltip } from '@mui/material';
import { EditNote as EditNoteIcon } from '@mui/icons-material';
import { TimesheetCellProps } from '../../../interfaces';
import { TimesheetStatus } from '@tms/shared';
import StatusDot from '../common/StatusDot';

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
        justifyContent: 'flex-start',
        gap: '6px',
        width: '100%',
        position: 'relative',
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
                width: '50px',
                minWidth: '50px',
                maxWidth: '50px',
                height: '20px',
                borderRadius: 1,
                textAlign: 'left',
                fontSize: '14px',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                '& input': {
                  textAlign: 'left',
                  paddingLeft: '0px',
                  paddingRight: '0px',
                  paddingTop: '0px',
                  paddingBottom: '0px',
                  width: '100%',
                  height: '20px',
                  lineHeight: '20px',
                },
              }}
              placeholder="00.00"
            />
          ) : (
            <div
              onClick={() => (isEditable ? onCellClick() : undefined)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                opacity: isEditable ? 1 : 0.7,
                textAlign: 'left',
                width: '50px',
                height: '20px',
                paddingLeft: '0px',
                paddingRight: '0px',
                paddingTop: '0px',
                paddingBottom: '0px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                lineHeight: '20px',
              }}
            >
              {hour}
            </div>
          )}

          {/* Description icon - always visible */}
          <Tooltip 
            title={description ? `Description: ${description}` : ''}
            arrow
            placement="top"
            disableHoverListener={!description}
          >
            <span>
              <IconButton
                size="small"
                onClick={onDescriptionClick}
                disabled={!isEditable}
                sx={{
                  padding: '0px',
                  minWidth: 'auto',
                  width: '20px',
                  height: '20px',
                }}
              >
                <EditNoteIcon
                  fontSize="small"
                  sx={{
                    color: description ? 'text.secondary' : 'lightgray',
                    opacity: 1,
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>

          {/* Status indicator dot - positioned after the description button */}
          {parseFloat(hour) > 0 && dayStatus !== TimesheetStatus.Draft && (
            <StatusDot color={getStatusColor(dayStatus)} />
          )}
    </div>
  );
};

export default TimesheetCell;