import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { IWeekNavigatorProps } from '../../../interfaces/navigation';

const WeekNavigator: React.FC<IWeekNavigatorProps> = ({
  startDate,
  endDate,
  onPreviousWeek,
  onNextWeek,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <IconButton onClick={onPreviousWeek} size="small">
        <ArrowBackIcon
          sx={{ color: (theme) => theme.palette.primary.main }}
        />
      </IconButton>
      
      <Typography variant="body2" sx={{ minWidth: '200px', textAlign: 'center' }}>
        {startDate} to {endDate}
      </Typography>
      
      <IconButton onClick={onNextWeek} size="small">
        <ArrowForwardIcon
          sx={{ color: (theme) => theme.palette.primary.main }}
        />
      </IconButton>
    </Box>
  );
};

export default WeekNavigator;