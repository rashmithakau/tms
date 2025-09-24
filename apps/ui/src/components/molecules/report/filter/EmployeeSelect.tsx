import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, Checkbox, ListItemText, Box, useTheme } from '@mui/material';
import { EmployeeSelectProps } from '../../../../interfaces/report/filter'
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({ employees, selectedIds, onChange, disabled }) => {
  const theme = useTheme();
  
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
        backgroundColor: theme.palette.background.default,
      },
    },
  };

  return (
  <FormControl fullWidth size="small" disabled={disabled}>
    <InputLabel>Employees</InputLabel>
    <Select
      multiple
      value={selectedIds}
      onChange={e => onChange(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
      input={<OutlinedInput label="Employees" />}
      renderValue={selected => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(selected as string[]).map(employeeId => {
            const employee = employees.find(emp => emp._id === employeeId);
            return (
              <Chip
                key={employeeId}
                label={employee ? `${employee.firstName} ${employee.lastName}` : employeeId}
                size="small"
              />
            );
          })}
        </Box>
      )}
      MenuProps={MenuProps}
    >
      {employees.map(employee => (
        <MenuItem key={employee._id} value={employee._id}>
          <Checkbox 
            checked={selectedIds.indexOf(employee._id) > -1} 
            sx={{ backgroundColor: theme.palette.background.default }}
          />
          <ListItemText primary={`${employee.firstName} ${employee.lastName}`} secondary={employee.email}  />
       
        </MenuItem>
      ))}
    </Select>
  </FormControl>
  );
};

export default EmployeeSelect;
