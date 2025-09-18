import React from 'react';
import { TableCell, TableRow } from '@mui/material';
import { ITimesheetTotalRowProps } from '../../../interfaces/component/timesheet';

const TimesheetTotalRow: React.FC<ITimesheetTotalRowProps> = ({ days, calcColTotal, calcGrandTotal }) => (
  <TableRow style={{ backgroundColor: '#f5f5f5' }}>
    <TableCell style={{ fontWeight: 'bold' }}>Total</TableCell>
    <TableCell />
    {days.map((_, colIndex) => (
      <TableCell key={colIndex} align="center" style={{ fontWeight: 'bold' }}>
        {calcColTotal(colIndex)}
      </TableCell>
    ))}
    <TableCell align="center" style={{ fontWeight: 'bold' }}>
      {calcGrandTotal()}
    </TableCell>
  </TableRow>
);

export default TimesheetTotalRow;
