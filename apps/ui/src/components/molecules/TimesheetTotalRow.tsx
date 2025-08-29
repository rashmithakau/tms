import React from 'react';
import { TableRow, TableCell } from '@mui/material';
import theme from '../../styles/theme';

export interface TimesheetTotalRowProps {
  days: number;
  columnTotals: string[];
  grandTotal: string;
  showCategoryColumn?: boolean;
}

const TimesheetTotalRow: React.FC<TimesheetTotalRowProps> = ({
  days,
  columnTotals,
  grandTotal,
  showCategoryColumn = true,
}) => {
  return (
    <TableRow sx={{ backgroundColor: theme.palette.grey[200] }}>
      {showCategoryColumn && <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>}
      <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
      {columnTotals.map((total, index) => (
        <TableCell
          key={index}
          align="center"
          sx={{ fontWeight: 'bold' }}
        >
          {total}
        </TableCell>
      ))}
      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
        {grandTotal}
      </TableCell>
    </TableRow>
  );
};

export default TimesheetTotalRow;