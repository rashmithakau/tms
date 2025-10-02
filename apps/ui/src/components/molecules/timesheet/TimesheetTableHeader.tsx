import React from 'react';
import { TableHead, TableRow, TableCell } from '@mui/material';
import { isSameDay } from 'date-fns';
import theme from '../../../styles/theme';
import { ITimesheetTableHeaderProps } from '../../../interfaces/component/timesheet';

const TimesheetTableHeader: React.FC<ITimesheetTableHeaderProps> = ({ days }) => {
  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: theme.palette.background.paper }}>
        <TableCell align="left" sx={{ textAlign: 'left' }} />
        <TableCell align="left" sx={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: '16px', paddingRight: '16px' }}>
          Task/Project
        </TableCell>
        {days.map((day) => (
          <TableCell
            key={day.day}
            align="left"
            sx={{
              fontWeight: 'bold',
              textAlign: 'left',
              paddingLeft: '16px',
              paddingRight: '16px',
              backgroundColor: isSameDay(day.date, new Date())
                ? theme.palette.action.hover
                : 'inherit',
            }}
          >
            {day.day}
          </TableCell>
        ))}
        <TableCell align="left" sx={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: '16px', paddingRight: '16px' }}>
          Total
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

export default TimesheetTableHeader;