import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { HistoryActionType } from '../../../interfaces/api';

interface HistoryFilterProps {
  onFilterChange: (filters: {
    actionType?: HistoryActionType[];
    entityType?: ('User' | 'Project' | 'Team')[];
    startDate?: string;
    endDate?: string;
  }) => void;
  showUserFilter?: boolean;
}

const actionTypeOptions = [
  { value: HistoryActionType.USER_CREATED, label: 'User Created' },
  { value: HistoryActionType.USER_DEACTIVATED, label: 'User Deactivated' },
  { value: HistoryActionType.USER_REACTIVATED, label: 'User Reactivated' },
  { value: HistoryActionType.USER_UPDATED, label: 'User Updated' },
  { value: HistoryActionType.USER_ROLE_CHANGED, label: 'User Role Changed' },
  { value: HistoryActionType.PROJECT_CREATED, label: 'Project Created' },
  { value: HistoryActionType.PROJECT_SUPERVISOR_ASSIGNED, label: 'Project Supervisor Assigned' },
  { value: HistoryActionType.PROJECT_SUPERVISOR_CHANGED, label: 'Project Supervisor Changed' },
  { value: HistoryActionType.PROJECT_EMPLOYEE_ADDED, label: 'Project Employee Added' },
  { value: HistoryActionType.PROJECT_EMPLOYEE_REMOVED, label: 'Project Employee Removed' },
  { value: HistoryActionType.PROJECT_DELETED, label: 'Project Deleted' },
  { value: HistoryActionType.PROJECT_RESTORED, label: 'Project Restored' },
  { value: HistoryActionType.TEAM_CREATED, label: 'Team Created' },
  { value: HistoryActionType.TEAM_SUPERVISOR_ASSIGNED, label: 'Team Supervisor Assigned' },
  { value: HistoryActionType.TEAM_SUPERVISOR_CHANGED, label: 'Team Supervisor Changed' },
  { value: HistoryActionType.TEAM_MEMBER_ADDED, label: 'Team Member Added' },
  { value: HistoryActionType.TEAM_MEMBER_REMOVED, label: 'Team Member Removed' },
  { value: HistoryActionType.TEAM_DELETED, label: 'Team Deleted' },
];

const entityTypeOptions = [
  { value: 'User', label: 'User' },
  { value: 'Project', label: 'Project' },
  { value: 'Team', label: 'Team' },
];

const HistoryFilter: React.FC<HistoryFilterProps> = ({ onFilterChange, showUserFilter = false }) => {
  const [selectedActionTypes, setSelectedActionTypes] = useState<HistoryActionType[]>([]);
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<('User' | 'Project' | 'Team')[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleActionTypeChange = (event: SelectChangeEvent<HistoryActionType[]>) => {
    const value = event.target.value as HistoryActionType[];
    setSelectedActionTypes(value);
  };

  const handleEntityTypeChange = (event: SelectChangeEvent<('User' | 'Project' | 'Team')[]>) => {
    const value = event.target.value as ('User' | 'Project' | 'Team')[];
    setSelectedEntityTypes(value);
  };

  const handleApplyFilters = () => {
    onFilterChange({
      actionType: selectedActionTypes.length > 0 ? selectedActionTypes : undefined,
      entityType: selectedEntityTypes.length > 0 ? selectedEntityTypes : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleClearFilters = () => {
    setSelectedActionTypes([]);
    setSelectedEntityTypes([]);
    setStartDate('');
    setEndDate('');
    onFilterChange({});
  };

  const hasActiveFilters = 
    selectedActionTypes.length > 0 || 
    selectedEntityTypes.length > 0 || 
    startDate || 
    endDate;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Entity Type</InputLabel>
          <Select
            multiple
            value={selectedEntityTypes}
            onChange={handleEntityTypeChange}
            label="Entity Type"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {entityTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 250 }} size="small">
          <InputLabel>Action Type</InputLabel>
          <Select
            multiple
            value={selectedActionTypes}
            onChange={handleActionTypeChange}
            label="Action Type"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={actionTypeOptions.find(o => o.value === value)?.label || value} 
                    size="small" 
                  />
                ))}
              </Box>
            )}
          >
            {actionTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Start Date"
          type="date"
          size="small"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />

        <TextField
          label="End Date"
          type="date"
          size="small"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />

        <Button
          variant="contained"
          startIcon={<FilterListIcon />}
          onClick={handleApplyFilters}
          sx={{ minWidth: 120 }}
        >
          Apply
        </Button>

        {hasActiveFilters && (
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            sx={{ minWidth: 120 }}
          >
            Clear
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default HistoryFilter;
