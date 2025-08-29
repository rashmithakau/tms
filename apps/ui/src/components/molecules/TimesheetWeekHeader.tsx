import React from 'react';
import { TableHead, TableRow, TableCell } from '@mui/material';
import { isSameDay } from 'date-fns';
import theme from '../../styles/theme';

export interface WeekDay {
  day: string;
  date: Date;
}

export interface TimesheetWeekHeaderProps {
  days: WeekDay[];
  showCategoryColumn?: boolean;
}

const TimesheetWeekHeader: React.FC<TimesheetWeekHeaderProps> = ({
  days,
  showCategoryColumn = true,
}) => {
  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: theme.palette.background.paper }}>
        {showCategoryColumn && <TableCell />}
        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
          Work/Project
        </TableCell>
        {days.map((day) => (
          <TableCell
            key={day.day}
            align="center"
            sx={{
              fontWeight: 'bold',
              backgroundColor: isSameDay(day.date, new Date())
                ? theme.palette.action.hover
                : 'inherit',
            }}
          >
            {day.day}
          </TableCell>
        ))}
        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
          Total
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

export default TimesheetWeekHeader;