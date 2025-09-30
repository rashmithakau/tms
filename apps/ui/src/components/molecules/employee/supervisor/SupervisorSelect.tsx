import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ISupervisorSelectProps } from '../../../../interfaces/component';

const SupervisorSelect: React.FC<ISupervisorSelectProps> = ({
  employees,
  value,
  onChange,
  disabled,
}) => {
  const theme = useTheme();
  return (
    <FormControl fullWidth size="small">
      <InputLabel id="supervisor-select">Project Manager</InputLabel>
      <Select
        labelId="supervisor-select"
        label="Project Manager"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? String(e.target.value) : null)}
        disabled={disabled}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 200,
              backgroundColor: theme.palette.background.default,
            },
          },
        }}
      >
        {employees.map((emp) => (
          <MenuItem key={emp.id} value={emp.id}>
            {emp.designation ? `${emp.name} - ${emp.designation}` : emp.name}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText sx={{ m: 0, mt: 0.5 }}>
        <span style={{ fontSize: '0.75rem' }}>Choose a Project Manager from selected employees</span>
      </FormHelperText>
    </FormControl>
  );
};

export default SupervisorSelect;