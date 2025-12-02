import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import { ReportTypeSelectProps } from '../../../../interfaces/report/filter';


const ReportTypeSelect: React.FC<ReportTypeSelectProps> = ({
  reportType,
  onReportTypeChange,
  disabled = false,
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ flex: 1 }}>
      <FormControl fullWidth size="small" disabled={disabled} variant="outlined">
        <InputLabel id="report-type-label">Report Type</InputLabel>
        <Select
          labelId="report-type-label"
          id="report-type"
          value={reportType || ''}
          label="Report Type"
          onChange={(e) =>
            onReportTypeChange?.(
              e.target.value as
                | 'submission-status'
                | 'approval-status'
                | 'detailed-timesheet'
                | 'timesheet-entries'
            )
          }
          MenuProps={{
            PaperProps: {
              style: {
                backgroundColor: theme.palette.background.default,
              },
            },
          }}
        >
          <MenuItem value="" disabled>
            <em>Select report type</em>
          </MenuItem>
          <MenuItem value="submission-status">Submission Status</MenuItem>
          <MenuItem value="approval-status">Approval Status</MenuItem>
          <MenuItem value="detailed-timesheet">Detailed Timesheet</MenuItem>
          <MenuItem value="timesheet-entries">Timesheet Entries</MenuItem>
          
        </Select>
      </FormControl>
    </Box>
  );
};

export default ReportTypeSelect;
