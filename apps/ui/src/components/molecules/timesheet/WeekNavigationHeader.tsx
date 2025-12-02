import React from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { IWeekNavigationHeaderProps } from '../../../interfaces/component/timesheet';

const WeekNavigationHeader: React.FC<IWeekNavigationHeaderProps> = ({ employeeName, currentWeekStart, weekEndDate, onPrev, onNext }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 2 }}>
    <Typography variant="h6" component="h3">{employeeName}'s Timesheet</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton onClick={onPrev} size="small"><ArrowBackIcon /></IconButton>
      <Typography variant="body2" sx={{ minWidth: 200, textAlign: 'center' }}>
        {currentWeekStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', timeZone: 'UTC' })}
        &nbsp;to&nbsp;
        {weekEndDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' })}
      </Typography>
      <IconButton onClick={onNext} size="small"><ArrowForwardIcon /></IconButton>
    </Box>
  </Box>
);

export default WeekNavigationHeader;
