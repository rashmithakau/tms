import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  SelectChangeEvent,
  Popover,
  Typography,
  Divider,
} from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import dayjs, { Dayjs } from 'dayjs';
import { HistoryActionType } from '../../../interfaces/api';
import { getAllActiveUsers } from '../../../api/user';
import { DatePickerAtom } from '../../atoms/report';
import EmployeeSelect from '../report/filter/EmployeeSelect';
import BaseBtn from '../../atoms/common/button/BaseBtn';
import { useTheme } from '@mui/material';

interface HistoryFilterProps {
  onFilterChange: (filters: {
    actionType?: HistoryActionType[];
    entityType?: ('User' | 'Project' | 'Team')[];
    performedBy?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  showUserFilter?: boolean;
}

interface UserOption {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
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

const HistoryFilter: React.FC<HistoryFilterProps> = ({ onFilterChange, showUserFilter = true }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const [selectedActionTypes, setSelectedActionTypes] = useState<HistoryActionType[]>([]);
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<('User' | 'Project' | 'Team')[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [employees, setEmployees] = useState<UserOption[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (showUserFilter) {
        setLoadingEmployees(true);
        try {
          const response = await getAllActiveUsers();
          setEmployees(response.data.users || []);
        } catch (error) {
          console.error('Failed to fetch employees:', error);
          setEmployees([]);
        } finally {
          setLoadingEmployees(false);
        }
      }
    };
    
    fetchEmployees();
  }, [showUserFilter]);

  const handleActionTypeChange = (event: SelectChangeEvent<HistoryActionType[]>) => {
    const value = event.target.value as HistoryActionType[];
    setSelectedActionTypes(value);
  };

  const handleEntityTypeChange = (event: SelectChangeEvent<('User' | 'Project' | 'Team')[]>) => {
    const value = event.target.value as ('User' | 'Project' | 'Team')[];
    setSelectedEntityTypes(value);
  };

  const handleEmployeeChange = (ids: string[]) => {
    setSelectedEmployeeIds(ids);
  };

  const handleStartDateChange = (date: Dayjs | null) => {
    setStartDate(date ? date.format('YYYY-MM-DD') : null);
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    setEndDate(date ? date.format('YYYY-MM-DD') : null);
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApplyFilters = () => {
    onFilterChange({
      actionType: selectedActionTypes.length > 0 ? selectedActionTypes : undefined,
      entityType: selectedEntityTypes.length > 0 ? selectedEntityTypes : undefined,
      performedBy: selectedEmployeeIds.length === 1 ? selectedEmployeeIds[0] : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    handleClose();
  };

  const handleClearFilters = () => {
    setSelectedActionTypes([]);
    setSelectedEntityTypes([]);
    setSelectedEmployeeIds([]);
    setStartDate(null);
    setEndDate(null);
    onFilterChange({});
  };

  const hasActiveFilters = 
    selectedActionTypes.length > 0 || 
    selectedEntityTypes.length > 0 || 
    selectedEmployeeIds.length > 0 ||
    startDate || 
    endDate;

  const activeFilterCount = 
    (selectedActionTypes.length > 0 ? 1 : 0) +
    (selectedEntityTypes.length > 0 ? 1 : 0) +
    (selectedEmployeeIds.length > 0 ? 1 : 0) +
    (startDate ? 1 : 0) +
    (endDate ? 1 : 0);

  return (
    <Box>
      <BaseBtn
        startIcon={<FilterAltOutlinedIcon />}
        onClick={handleOpen}
        variant="text"
        aria-label="Open filter menu"
        aria-controls={open ? 'history-filter-popover' : undefined}
      >
        Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
      </BaseBtn>

      <Popover
        id="history-filter-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ 
          sx: { 
            p: 3, 
            width: 450,
            maxHeight: '80vh',
            bgcolor: theme.palette.background.paper 
          } 
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filter History
        </Typography>

        <Stack spacing={2.5}>
          {/* Category Filter */}
          <Box>
            <FormControl fullWidth size="small">
              <InputLabel>Select categories</InputLabel>
              <Select
                multiple
                value={selectedEntityTypes}
                onChange={handleEntityTypeChange}
                label="Select categories"
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
          </Box>

          {/* Action Type Filter */}
          <Box>
            <FormControl fullWidth size="small">
              <InputLabel>Select action types</InputLabel>
              <Select
                multiple
                value={selectedActionTypes}
                onChange={handleActionTypeChange}
                label="Select action types"
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
          </Box>

          {/* Employee Filter */}
          {showUserFilter && (
            <Box>
              <EmployeeSelect
                employees={employees}
                selectedIds={selectedEmployeeIds}
                onChange={handleEmployeeChange}
                disabled={loadingEmployees}
              />
            </Box>
          )}

          {/* Date Range Filter */}
          <Box>
            <Stack direction="row" spacing={2}>
              <DatePickerAtom
                label="Start Date"
                value={startDate}
                onChange={handleStartDateChange}
                disabled={false}
              />
              <DatePickerAtom
                label="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                disabled={false}
                minDate={startDate ? dayjs(startDate) : undefined}
              />
            </Stack>
          </Box>
        </Stack>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Active Filters:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {selectedEntityTypes.map((type) => (
                  <Chip
                    key={type}
                    size="small"
                    label={`Category: ${type}`}
                    onDelete={() => {
                      setSelectedEntityTypes(selectedEntityTypes.filter(t => t !== type));
                    }}
                  />
                ))}
                {selectedActionTypes.map((type) => (
                  <Chip
                    key={type}
                    size="small"
                    label={actionTypeOptions.find(o => o.value === type)?.label || type}
                    onDelete={() => {
                      setSelectedActionTypes(selectedActionTypes.filter(t => t !== type));
                    }}
                  />
                ))}
                {selectedEmployeeIds.map((id) => {
                  const employee = employees.find(emp => emp._id === id);
                  return (
                    <Chip
                      key={id}
                      size="small"
                      label={employee ? `${employee.firstName} ${employee.lastName}` : id}
                      onDelete={() => {
                        setSelectedEmployeeIds(selectedEmployeeIds.filter(empId => empId !== id));
                      }}
                    />
                  );
                })}
                {startDate && (
                  <Chip
                    size="small"
                    label={`From: ${dayjs(startDate).format('MMM DD, YYYY')}`}
                    onDelete={() => setStartDate(null)}
                  />
                )}
                {endDate && (
                  <Chip
                    size="small"
                    label={`To: ${dayjs(endDate).format('MMM DD, YYYY')}`}
                    onDelete={() => setEndDate(null)}
                  />
                )}
              </Stack>
            </Box>
          </>
        )}

        {/* Action Buttons */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <BaseBtn
            size="small"
            variant="outlined"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            Clear All
          </BaseBtn>
          <BaseBtn 
            size="small" 
            variant="contained" 
            onClick={handleApplyFilters}
          >
            Apply Filters
          </BaseBtn>
        </Box>
      </Popover>
    </Box>
  );
};

export default HistoryFilter;
