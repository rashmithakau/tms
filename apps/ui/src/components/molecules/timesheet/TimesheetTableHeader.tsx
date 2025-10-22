import React from 'react';
import { TableHead, TableRow, TableCell } from '@mui/material';
import { isSameDay } from 'date-fns';
import theme from '../../../styles/theme';
import { ITimesheetTableHeaderProps } from '../../../interfaces/component/timesheet';

const TimesheetTableHeader: React.FC<ITimesheetTableHeaderProps> = ({ days }) => {
  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: theme.palette.background.paper }}>
        <TableCell align="center" sx={{ textAlign: 'center', paddingLeft: '16px', paddingRight: '16px', width: '50px', minWidth: '50px' }} />
        <TableCell align="left" sx={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: '16px', paddingRight: '16px', width: '200px', minWidth: '200px' }}>
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
              width: '120px',
              minWidth: '120px',
              backgroundColor: isSameDay(day.date, new Date())
                ? theme.palette.action.hover
                : 'inherit',
            }}
          >
            {day.day}
          </TableCell>
        ))}
        <TableCell align="left" sx={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: '16px', paddingRight: '16px', width: '100px', minWidth: '100px' }}>
          Total
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

export default TimesheetTableHeader;