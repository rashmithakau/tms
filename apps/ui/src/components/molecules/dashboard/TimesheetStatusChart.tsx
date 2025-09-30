import React, { useMemo } from 'react';
import { Paper, Box, Typography, Alert } from '@mui/material';
import { PieChart } from '../../atoms/dashboard';
import { ITimesheetStatusChartProps, IPieChartData } from '../../../interfaces/dashboard';
import { Warning, BarChart } from '@mui/icons-material';
import PageLoading from '../../molecules/common/loading/PageLoading';

const TimesheetStatusChart: React.FC<ITimesheetStatusChartProps> = ({
  submittedCount,
  pendingCount,
  lateCount,
  approvedCount,
  rejectedCount,
  month = 'September',
  year = 2025,
  title,
  loading = false,
  error = null
}) => {
  const chartTitle = title || `Timesheet Status - ${month} ${year}`;

  if (loading) {
    return (
      <Paper 
        sx={{ 
          p: 3, 
          height: '100%',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative'
        }}
      >
        <PageLoading 
          variant="overlay" 
          message="Loading chart data..." 
          size="medium"
        />
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper 
        sx={{ 
          p: 3, 
          height: '100%',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <BarChart color="primary" />
          <Typography variant="h6" component="h3" fontWeight="bold">
            {chartTitle}
          </Typography>
        </Box>
        
        <Box flex={1} display="flex" alignItems="center">
          <Alert 
            severity="error" 
            icon={<Warning />}
            sx={{ 
              width: '100%',
              '& .MuiAlert-message': { 
                width: '100%' 
              }
            }}
          >
            <Typography variant="body2">
              {error || 'Failed to load timesheet statistics'}
            </Typography>
          </Alert>
        </Box>
      </Paper>
    );
  }

  const chartData: IPieChartData[] = useMemo(() => {
    const data = [
      {
        label: 'Submitted',
        value: submittedCount,
        color: '#2196F3', // Blue
      },
      {
        label: 'Pending Review',
        value: pendingCount,
        color: '#FF9800', // Orange
      },
      {
        label: 'Late Submission',
        value: lateCount,
        color: '#F44336', // Red
      },
      {
        label: 'Approved',
        value: approvedCount,
        color: '#4CAF50', // Green
      },
      {
        label: 'Rejected',
        value: rejectedCount,
        color: '#9C27B0', // Purple
      },
    ];

    return data.filter(item => item.value > 0);
  }, [submittedCount, pendingCount, lateCount, approvedCount, rejectedCount]);

  const totalTimesheets = useMemo(() => {
    return submittedCount + pendingCount + lateCount + approvedCount + rejectedCount;
  }, [submittedCount, pendingCount, lateCount, approvedCount, rejectedCount]);

  if (totalTimesheets === 0) {
    return (
      <Paper 
        sx={{ 
          p: 3, 
          height: '100%',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h6" component="h3" gutterBottom fontWeight="bold" textAlign="center">
          {chartTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          No timesheet data available for {month} {year}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 3, 
        height: '100%',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box display="flex" flexDirection="column" height="100%">
        <PieChart
          data={chartData}
          title={chartTitle}
          width={280}
          height={250}
          showLegend={false}
          showTooltip={true}
        />
        
        {/* Summary Statistics */}
        <Box mt={2} textAlign="center">
          <Box display="flex" justifyContent="center" gap={2} mt={1} flexWrap="wrap">
            {chartData.map((item) => {
              const percentage = ((item.value / totalTimesheets) * 100).toFixed(1);
              return (
                <Box key={item.label} display="flex" alignItems="center" gap={0.5}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: item.color,
                      borderRadius: '50%',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {item.label}: {percentage}%
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default TimesheetStatusChart;
