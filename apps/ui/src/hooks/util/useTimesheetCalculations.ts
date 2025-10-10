import { useMemo } from 'react';
import { TimesheetData } from '../../interfaces/hooks/timesheet';

export const useTimesheetCalculations = (data: TimesheetData[]) => {

  const formatTotal = (value: number): string => {
    return value.toFixed(2).padStart(5, '0');
  };

  const calcRowTotal = (hours: string[]): string => {
    const total = hours.reduce((sum, h) => sum + parseFloat(h || '0'), 0);
    return formatTotal(total);
  };

  const calcColTotal = (colIndex: number): string => {
    const total = data
      .flatMap((cat) => cat.items)
      .reduce((sum, row) => sum + parseFloat(row.hours[colIndex] || '0'), 0);
    return formatTotal(total);
  };

  
  const calcGrandTotal = (): string => {
    const total = data
      .flatMap((cat) => cat.items)
      .reduce(
        (sum, row) => sum + row.hours.reduce((s, h) => s + parseFloat(h || '0'), 0),
        0
      );
    return formatTotal(total);
  };
  const columnTotals = useMemo(() => {
    const totals: string[] = [];
    for (let i = 0; i < 7; i++) {
      totals.push(calcColTotal(i));
    }
    return totals;
  }, [data]);


  const grandTotal = useMemo(() => calcGrandTotal(), [data]);

  return {
    calcRowTotal,
    calcColTotal,
    calcGrandTotal,
    columnTotals,
    grandTotal,
  };
};