import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ReportInformationPanel: React.FC = () => {
  const theme = useTheme();
  return (
    <Paper sx={{ bgcolor: theme.palette.background.default }} elevation={0}>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gridTemplateRows: { xs: 'repeat(4, auto)', md: 'auto auto' },
        gap: 1.5
      }}>
        {/* Top Left - Submission Status Report */}
        <Box sx={{ 
          p: 1, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          bgcolor: theme.palette.background.paper
        }}>
          <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }} gutterBottom>
            Submission Status Report
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Track employee timesheet submission compliance, identify late submissions,
            and monitor missing timesheets within specified date ranges.
          </Typography>
        </Box>

        {/* Top Right - Approval Status Report */}
        <Box sx={{ 
          p: 1.5, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          bgcolor: theme.palette.background.paper
        }}>
          <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }} gutterBottom>
            Approval Status Report
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Monitor the approval workflow, view pending timesheets requiring attention,
            and track approved/rejected timesheet statistics.
          </Typography>
        </Box>

        {/* Bottom Left - Detailed Timesheet Report */}
        <Box sx={{ 
          p: 1.5, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          bgcolor: theme.palette.background.paper
        }}>
          <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }} gutterBottom>
            Detailed Timesheet Report
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Generate comprehensive timesheet data including hours worked, project details,
            daily breakdowns, and approval status for each entry.
          </Typography>
        </Box>

        {/* Bottom Right - Timesheet Entries Report */}
        <Box sx={{ 
          p: 1.5, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          bgcolor: theme.palette.background.paper
        }}>
          <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }} gutterBottom>
            Timesheet Entries Report
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            View individual timesheet entries with detailed information about time allocations,
            project assignments, and entry-specific data for comprehensive analysis.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ReportInformationPanel;
