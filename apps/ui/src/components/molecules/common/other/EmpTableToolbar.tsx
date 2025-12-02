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
import BaseBtn from '../../../atoms/common/button/BaseBtn';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useTheme } from '@mui/material';
import type { IEmpTableToolbarProps } from '../../../../interfaces/component';

export default function EmpTableToolbar({
  selectedProjectIds,
  onSelectedProjectIdsChange,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  availableRoles,
}: IEmpTableToolbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const activeCount =
    (selectedProjectIds.length > 0 ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (roleFilter !== 'all' ? 1 : 0);

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

        <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
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
          <ToggleButton value="all" aria-label="All">
            All
          </ToggleButton>
          {availableRoles ? (
            availableRoles.map((role) => (
              <ToggleButton key={role.value} value={role.value} aria-label={role.label}>
                {role.label}
              </ToggleButton>
            ))
          ) : (
            <>
              <ToggleButton value="admin" aria-label="Admin">
                Admin
              </ToggleButton>
              <ToggleButton value="supervisorAdmin" aria-label="Supervisor Admin">
                Supervisor Admin
              </ToggleButton>
              <ToggleButton value="supervisor" aria-label="Supervisor">
                Supervisor
              </ToggleButton>
              <ToggleButton value="emp" aria-label="Employee">
                Employee
              </ToggleButton>
            </>
          )}
        </ToggleButtonGroup>

        <Divider sx={{ my: 1 }} />
        <Box>
          {activeCount > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
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
              {roleFilter !== 'all' && (
                <Chip
                  size="small"
                  label={`Role: ${availableRoles ? availableRoles.find(r => r.value === roleFilter)?.label || roleFilter : roleFilter === 'supervisorAdmin' ? 'Supervisor Admin' : roleFilter === 'emp' ? 'Employee' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}`}
                  onDelete={() => onRoleFilterChange('all')}
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
                onSelectedProjectIdsChange([]);
                onStatusFilterChange('all');
                onRoleFilterChange('all');
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
