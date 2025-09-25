import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  IconButton, 
  Grid,
  useTheme 
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight
} from '@mui/icons-material';
import { ICalendarProps } from '../../../interfaces/dashboard';

const Calendar: React.FC<ICalendarProps> = ({
  title = "Calendar",
  selectedDate,
  onDateSelect,
  highlightToday = true
}) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    if (onDateSelect) {
      onDateSelect(clickedDate);
    }
  };
  
  const isToday = (day: number) => {
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };
  
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === year && 
           selectedDate.getMonth() === month && 
           selectedDate.getDate() === day;
  };
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <Box key={`empty-${i}`} sx={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        </Box>
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(day);
      const isSelectedDay = isSelected(day);
      
      days.push(
        <Box
          key={day}
          onClick={() => handleDateClick(day)}
          sx={{
            height: 32,
            width: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: onDateSelect ? 'pointer' : 'default',
            borderRadius: '50%',
            backgroundColor: isSelectedDay
              ? theme.palette.primary.main
              : isCurrentDay && highlightToday
                ? theme.palette.primary.main
                : 'transparent',
            color: isSelectedDay || (isCurrentDay && highlightToday)
              ? theme.palette.primary.contrastText
              : theme.palette.text.primary,
            fontWeight: isCurrentDay || isSelectedDay ? 'bold' : 'normal',
            '&:hover': onDateSelect ? {
              backgroundColor: theme.palette.action.hover,
            } : {},
            transition: 'all 0.2s ease',
          }}
        >
          <Typography variant="body2" fontWeight="inherit">
            {day}
          </Typography>
        </Box>
      );
    }
    
    return days;
  };
  
  return (
    <Paper 
      sx={{ 
        p: 3, 
        height: '280px', // Fixed height to match stats
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Month Navigation */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <IconButton onClick={goToPreviousMonth} size="small">
          <ChevronLeft />
        </IconButton>
        <Typography variant="subtitle1" fontWeight="medium">
          {monthNames[month]} {year}
        </Typography>
        <IconButton onClick={goToNextMonth} size="small">
          <ChevronRight />
        </IconButton>
      </Box>
      
      {/* Day Headers */}
      <Grid container spacing={0} mb={1}>
        {dayNames.map((dayName) => (
          <Grid size={12/7} key={dayName} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="medium">
              {dayName}
            </Typography>
          </Grid>
        ))}
      </Grid>
      
      {/* Calendar Grid */}
      <Box flex={1}>
        <Grid container spacing={0} sx={{ height: '100%' }}>
          {renderCalendarDays().map((day, index) => (
            <Grid size={12/7} key={index} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {day}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

export default Calendar;
