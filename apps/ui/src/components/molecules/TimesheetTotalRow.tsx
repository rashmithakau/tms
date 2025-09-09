import React from 'react';
import { TableCell, TableRow } from '@mui/material';

interface TimesheetTotalRowProps {
  days: { day: string; date: Date }[];
  calcColTotal: (colIndex: number) => string;
  calcGrandTotal: () => string;
}

const TimesheetTotalRow: React.FC<TimesheetTotalRowProps> = ({ days, calcColTotal, calcGrandTotal }) => (
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
