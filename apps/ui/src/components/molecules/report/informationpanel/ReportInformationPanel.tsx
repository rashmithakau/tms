import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ReportInformationPanel: React.FC = () => {
  const theme = useTheme();
  return (
  <Paper sx={{  bgcolor: theme.palette.background.default }} elevation={0}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }} gutterBottom>
            Submission Status Report
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Track employee timesheet submission compliance, identify late submissions,
            and monitor missing timesheets within specified date ranges.
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }} gutterBottom>
            Approval Status Report
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Monitor the approval workflow, view pending timesheets requiring attention,
            and track approved/rejected timesheet statistics.
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }} gutterBottom>
            Detailed Timesheet Report
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Generate comprehensive timesheet data including hours worked, project details,
            daily breakdowns, and approval status for each entry.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ReportInformationPanel;
