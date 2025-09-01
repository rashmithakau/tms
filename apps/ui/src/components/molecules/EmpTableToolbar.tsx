import React, { useState } from 'react';
import {
  Box,
  Popover,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import BaseBtn from '../atoms/buttons/BaseBtn';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useTheme } from '@mui/material';

export type EmpRoleFilter = 'all' | 'employee' | 'supervisor';

const ROLE_OPTIONS: Array<EmpRoleFilter> = ['all', 'employee', 'supervisor'];

export default function EmpTableToolbar({
  roleFilter,
  onRoleFilterChange,
  projectsOptions,
  selectedProjectIds,
  onSelectedProjectIdsChange,
  statusFilter,
  onStatusFilterChange,
}: {
  roleFilter: EmpRoleFilter;
  onRoleFilterChange: (val: EmpRoleFilter) => void;
  projectsOptions: Array<{ id: string; name: string }>;
  selectedProjectIds: string[];
  onSelectedProjectIdsChange: (val: string[]) => void;
  statusFilter: 'all' | 'Active' | 'Inactive';
  onStatusFilterChange: (val: 'all' | 'Active' | 'Inactive') => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const activeCount =
    (roleFilter !== 'all' ? 1 : 0) + (selectedProjectIds.length > 0 ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const theme = useTheme();

 
  return (
    <Box>
      <BaseBtn
        startIcon={<FilterAltOutlinedIcon />}
        onClick={handleOpen}
        variant="text"
        aria-label="Open filter menu"
        aria-controls={open ? 'emp-filter-popover' : undefined}
      >
        Filter
      </BaseBtn>

      <Popover
        id="emp-filter-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: { p: 2, width: 260, bgcolor: theme.palette.background.paper },
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Role
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={roleFilter}
          onChange={(_, value) => value && onRoleFilterChange(value)}
          aria-label="Role filter"
          sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}
        >
          {ROLE_OPTIONS.map((option) => (
            <ToggleButton key={option} value={option} aria-label={option}>
              {option === 'all'
                ? 'All'
                : option === 'employee'
                ? 'Employee'
                : 'Supervisor'}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Projects
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={selectedProjectIds}
          onChange={(_, value) => {
            // value is an array of selected ids when exclusive is false
            onSelectedProjectIdsChange(Array.isArray(value) ? value : []);
          }}
          aria-label="Project filter"
          sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}
        >
          {projectsOptions.map((p) => (
            <ToggleButton key={p.id} value={p.id} aria-label={p.name}>
              {p.name}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Status
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={statusFilter}
          onChange={(_, value) => value && onStatusFilterChange(value)}
          aria-label="Status filter"
          sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}
        >
          <ToggleButton value="all" aria-label="All">
            All
          </ToggleButton>
          <ToggleButton value="Active" aria-label="Active">
            Active
          </ToggleButton>
          <ToggleButton value="Inactive" aria-label="Inactive">
            Inactive
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider sx={{ my: 1 }} />
        <Box>
          {activeCount > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
              {roleFilter !== 'all' && (
                <Chip
                  size="small"
                  label={`Role: ${
                    roleFilter === 'employee' ? 'Employee' : 'Supervisor'
                  }`}
                  onDelete={() => onRoleFilterChange('all')}
                />
              )}
              {selectedProjectIds.length > 0 && (
                <Chip
                  size="small"
                  label={`Projects: ${selectedProjectIds.length}`}
                  onDelete={() => onSelectedProjectIdsChange([])}
                />
              )}
              {statusFilter !== 'all' && (
                <Chip
                  size="small"
                  label={`Status: ${statusFilter}`}
                  onDelete={() => onStatusFilterChange('all')}
                />
              )}
            </Stack>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'right',
              padding: 2,
              gap: 2,
            }}
          >
            <BaseBtn
              size="small"
              variant="outlined"
              onClick={() => {
                onRoleFilterChange('all');
                onSelectedProjectIdsChange([]);
                onStatusFilterChange('all');
              }}
            >
              Clear
            </BaseBtn>
            <BaseBtn size="small" variant="contained" onClick={handleClose}>
              Done
            </BaseBtn>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
