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
      <FormControl fullWidth size="small" disabled={disabled}>
        <InputLabel id="report-type-label">Report Type</InputLabel>
        <Select
          labelId="report-type-label"
          value={reportType || ''}
          label="Report Type"
          onChange={(e) =>
            onReportTypeChange?.(
              e.target.value as
                | 'submission-status'
                | 'approval-status'
                | 'detailed-timesheet'
            )
          }
          displayEmpty
          MenuProps={{
            PaperProps: {
              style: {
                backgroundColor: theme.palette.background.default,
              },
            },
          }}
        >
          <MenuItem value="" disabled></MenuItem>
          <MenuItem value="submission-status">Submission Status</MenuItem>
          <MenuItem value="approval-status">Approval Status</MenuItem>
          <MenuItem value="detailed-timesheet">Detailed Timesheet</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default ReportTypeSelect;
