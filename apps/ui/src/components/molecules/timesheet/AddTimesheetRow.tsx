import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  TextField,
  Autocomplete,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Box,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { TimesheetStatus } from '@tms/shared';

export interface NewTimesheetEntry {
  date: string;
  projectId: string;
  projectName: string;
  task: string;
  description: string;
  hoursSpent: number;
  billableType: 'Billable' | 'Non-Billable';
}

interface AddTimesheetRowProps {
  projects: Array<{ _id: string; projectName: string }>;
  onSave: (entry: NewTimesheetEntry) => Promise<void>;
  onCancel: () => void;
}

const AddTimesheetRow: React.FC<AddTimesheetRowProps> = ({
  projects,
  onSave,
  onCancel,
}) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<NewTimesheetEntry>({
    date: today,
    projectId: '',
    projectName: '',
    task: '',
    description: '',
    hoursSpent: 0,
    billableType: 'Billable',
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.projectName) newErrors.project = 'Project is required';
    if (!formData.task.trim()) newErrors.task = 'Task is required';
    if (formData.hoursSpent <= 0) newErrors.hours = 'Hours must be greater than 0';
    if (formData.hoursSpent > 24) newErrors.hours = 'Hours cannot exceed 24';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleProjectChange = (_event: any, value: { _id: string; projectName: string } | null) => {
    if (value) {
      setFormData({
        ...formData,
        projectId: value._id,
        projectName: value.projectName,
      });
      setErrors({ ...errors, project: '' });
    } else {
      setFormData({
        ...formData,
        projectId: '',
        projectName: '',
      });
    }
  };

  return (
    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
      <TableCell>
        <TextField
          type="date"
          size="small"
          value={formData.date}
          onChange={(e) => {
            setFormData({ ...formData, date: e.target.value });
            setErrors({ ...errors, date: '' });
          }}
          error={!!errors.date}
          helperText={errors.date}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: '150px' }}
        />
      </TableCell>
      <TableCell>
        <Autocomplete
          size="small"
          options={projects}
          getOptionLabel={(option) => option.projectName}
          onChange={handleProjectChange}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select project..."
              error={!!errors.project}
              helperText={errors.project}
            />
          )}
          sx={{ minWidth: '200px' }}
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          placeholder="Task title..."
          value={formData.task}
          onChange={(e) => {
            setFormData({ ...formData, task: e.target.value });
            setErrors({ ...errors, task: '' });
          }}
          error={!!errors.task}
          helperText={errors.task}
          sx={{ minWidth: '150px' }}
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          multiline
          maxRows={3}
          placeholder="Description..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          sx={{ minWidth: '200px' }}
        />
      </TableCell>
      <TableCell>
        <TextField
          type="number"
          size="small"
          placeholder="0.00"
          value={formData.hoursSpent || ''}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            setFormData({ ...formData, hoursSpent: value });
            setErrors({ ...errors, hours: '' });
          }}
          inputProps={{ min: 0, max: 24, step: 0.25 }}
          error={!!errors.hours}
          helperText={errors.hours}
          sx={{ width: '100px' }}
        />
      </TableCell>
      <TableCell>
        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <Select
            value={formData.billableType}
            onChange={(e) =>
              setFormData({
                ...formData,
                billableType: e.target.value as 'Billable' | 'Non-Billable',
              })
            }
          >
            <MenuItem value="Billable">Billable</MenuItem>
            <MenuItem value="Non-Billable">Non-Billable</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
      <TableCell>
        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          Draft
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={handleSave}
            disabled={saving}
            title="Save"
          >
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={onCancel}
            disabled={saving}
            title="Cancel"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default AddTimesheetRow;
