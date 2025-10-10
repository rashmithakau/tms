import React from 'react';
import { TableCell, TableRow } from '@mui/material';
import { ITimesheetTotalRowProps } from '../../../interfaces/component/timesheet';
import theme from '../../../styles/theme';

const TimesheetTotalRow: React.FC<ITimesheetTotalRowProps> = ({ days, calcColTotal, calcGrandTotal }) => (
  <TableRow sx={{ backgroundColor: theme.palette.grey[200] }}>
    <TableCell sx={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: '16px', paddingRight: '16px', verticalAlign: 'middle', width: '50px', minWidth: '50px' }}>Total</TableCell>
    <TableCell sx={{ paddingLeft: '16px', paddingRight: '16px', verticalAlign: 'middle', width: '200px', minWidth: '200px' }} />
    {days.map((_, colIndex) => (
      <TableCell key={colIndex} align="left" sx={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: '16px', paddingRight: '16px', verticalAlign: 'middle', width: '120px', minWidth: '120px' }}>
        {calcColTotal(colIndex)}
      </TableCell>
    ))}
    <TableCell align="left" sx={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: '16px', paddingRight: '16px', verticalAlign: 'middle', width: '100px', minWidth: '100px' }}>
      {calcGrandTotal()}
    </TableCell>
  </TableRow>
);

export default TimesheetTotalRow;
