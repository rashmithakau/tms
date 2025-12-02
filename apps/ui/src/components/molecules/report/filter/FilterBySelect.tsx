import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import { FilterBySelectProps } from '../../../../interfaces/report/filter';

const FilterBySelect: React.FC<FilterBySelectProps> = ({
  filterBy,
  onFilterByChange,
  disabled = false,
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ flex: 1 }}>
      <FormControl fullWidth size="small" disabled={disabled} variant="outlined">
        <InputLabel id="filter-by-label">Filter By</InputLabel>
        <Select
          labelId="filter-by-label"
          id="filter-by"
          value={filterBy || ''}
          label="Filter By"
          onChange={(e) =>
            onFilterByChange?.(
              e.target.value as
                | 'user'
                | 'project'
                | 'team'
                | 'status'
            )
          }
           MenuProps={{
            PaperProps: {
              style: {
                backgroundColor: theme.palette.background.paper,
              },
            },
          }}
        >
          <MenuItem value="" disabled>
            <em>Select filter by</em>
          </MenuItem>
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="project">Project</MenuItem>
          <MenuItem value="team">Team</MenuItem>
          <MenuItem value="status">Status</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default FilterBySelect;
