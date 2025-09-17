import React from 'react';
import { TableHead, TableRow, TableCell } from '@mui/material';
import { isSameDay } from 'date-fns';
import theme from '../../../styles/theme';

interface DayInfo {
  day: string;
  date: Date;
}

interface TimesheetTableHeaderProps {
  days: DayInfo[];
}

const TimesheetTableHeader: React.FC<TimesheetTableHeaderProps> = ({ days }) => {
  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: theme.palette.background.paper }}>
        <TableCell />
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

export default TimesheetTableHeader;