import React from 'react';
import { Checkbox, FormControlLabel, Box } from '@mui/material';
import { TimesheetStatus } from '@tms/shared';
import { IDayCheckboxProps } from '../../../interfaces';

const getStatusColor = (status?: TimesheetStatus) => {
  switch (status) {
    case TimesheetStatus.Approved:
      return 'success.main';
    case TimesheetStatus.Rejected:
      return 'error.main';
    case TimesheetStatus.Pending:
      return 'warning.main';
    case TimesheetStatus.Draft:
      return 'grey.500';
    default:
      return 'grey.300';
  }
};

const DayCheckbox: React.FC<IDayCheckboxProps> = ({
  day,
  isSelected,
  onSelectionChange,
  status,
  disabled = false
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectionChange(event.target.checked);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 80,
        p: 1,
        borderRadius: 1,
        backgroundColor: status ? getStatusColor(status) : 'transparent',
        opacity: disabled ? 0.6 : 1,
        '&:hover': {
          backgroundColor: disabled ? undefined : 'action.hover',
        }
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={isSelected}
            onChange={handleChange}
            disabled={disabled}
            size="small"
            color="primary"
          />
        }
        label={day}
        labelPlacement="bottom"
        sx={{
          margin: 0,
          '& .MuiFormControlLabel-label': {
            fontSize: '0.75rem',
            textAlign: 'center',
            minWidth: 40,
          }
        }}
      />
      {status && (
        <Box
          sx={{
            mt: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: 1,
            backgroundColor: 'background.paper',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            color: getStatusColor(status),
            border: `1px solid ${getStatusColor(status)}`,
            textAlign: 'center',
            minWidth: 50,
          }}
        >
          {status}
        </Box>
      )}
    </Box>
  );
};

export default DayCheckbox;