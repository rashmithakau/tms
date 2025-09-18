import { useMemo } from 'react';
import { TimesheetData } from '../../interfaces/hooks/timesheet';

export const useTimesheetCalculations = (data: TimesheetData[]) => {

  const calcRowTotal = (hours: string[]): string => {
    return hours.reduce((sum, h) => sum + parseFloat(h || '0'), 0).toFixed(2);
  };

  const calcColTotal = (colIndex: number): string => {
    return data
      .flatMap((cat) => cat.items)
      .reduce((sum, row) => sum + parseFloat(row.hours[colIndex] || '0'), 0)
      .toFixed(2);
  };

  
  const calcGrandTotal = (): string => {
    return data
      .flatMap((cat) => cat.items)
      .reduce(
        (sum, row) => sum + row.hours.reduce((s, h) => s + parseFloat(h || '0'), 0),
        0
      )
      .toFixed(2);
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