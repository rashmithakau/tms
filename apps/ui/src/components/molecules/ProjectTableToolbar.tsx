import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import SearchField from './SearchField';

export default function ProjectTableToolbar({
  search,
  onSearch,
  billable,
  onBillableChange,
}: {
  search: string;
  onSearch: (val: string) => void;
  billable: 'all' | 'Yes' | 'No';
  onBillableChange: (val: 'all' | 'Yes' | 'No') => void;
}) {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
      <SearchField
        value={search}
        onChange={onSearch}
        placeholder="Search projects or supervisor..."
        label="Search"

        sx={{ width: 300 }}
      />
      <ToggleButtonGroup
        color="primary"
        value={billable}
        exclusive
        onChange={(_, val) => onBillableChange(val || 'all')}
        size="small"
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="Yes">Billable</ToggleButton>
        <ToggleButton value="No">Non-billable</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}





