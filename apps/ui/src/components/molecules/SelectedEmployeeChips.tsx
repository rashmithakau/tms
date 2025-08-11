import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { ISelectedEmployeeChipsProps } from '../../interfaces/ISelectedEmployeeChipsProps';
const SelectedEmployeeChips: React.FC<ISelectedEmployeeChipsProps> = ({
  employees,
  onRemove,
  title,
  sx,
}) => {
  if (employees.length === 0) return null;

  return (
    <Box sx={sx}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title} ({employees.length})
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {employees.map((employee) => (
          <Chip
            key={employee.id}
            label={`${employee.name} - ${employee.designation}`}
            onDelete={() => onRemove(employee.id)}
            variant="outlined"
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
};

export default SelectedEmployeeChips;
