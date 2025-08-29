import React from 'react';
import { TableCell, Box } from '@mui/material';
import HourInput from './inputFields/HourInput';
import DescriptionButton from './buttons/DescriptionButton';

export interface TimesheetCellProps {
  hour: string;
  description: string;
  isEditing: boolean;
  readOnly?: boolean;
  onCellClick: () => void;
  onHourChange: (value: string) => void;
  onHourBlur: () => void;
  onDescriptionClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const TimesheetCell: React.FC<TimesheetCellProps> = ({
  hour,
  description,
  isEditing,
  readOnly = false,
  onCellClick,
  onHourChange,
  onHourBlur,
  onDescriptionClick,
  onKeyDown,
}) => {
  return (
    <TableCell align="center" sx={{ padding: '8px 4px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
        }}
      >
        {isEditing && !readOnly ? (
          <HourInput
            value={hour}
            onChange={onHourChange}
            onBlur={onHourBlur}
            onKeyDown={onKeyDown}
            autoFocus
          />
        ) : (
          <Box
            onClick={readOnly ? undefined : onCellClick}
            sx={{
              cursor: readOnly ? 'default' : 'pointer',
              minWidth: 40,
              textAlign: 'center',
              padding: '4px 8px',
              borderRadius: 1,
              '&:hover': readOnly ? {} : {
                backgroundColor: 'action.hover',
              },
            }}
          >
            {hour}
          </Box>
        )}
        
        <DescriptionButton
          description={description}
          onClick={onDescriptionClick}
          disabled={readOnly}
        />
      </Box>
    </TableCell>
  );
};

export default TimesheetCell;