import { useMemo } from 'react';
import { TimesheetData } from '../timesheet/useTimesheetDataManagement';

export const useTimesheetCalculations = (data: TimesheetData[]) => {
  // Calculate total hours for a single row
  const calcRowTotal = (hours: string[]): string => {
    return hours.reduce((sum, h) => sum + parseFloat(h || '0'), 0).toFixed(2);
  };

  // Calculate total hours for a single column (day)
  const calcColTotal = (colIndex: number): string => {
    return data
      .flatMap((cat) => cat.items)
      .reduce((sum, row) => sum + parseFloat(row.hours[colIndex] || '0'), 0)
      .toFixed(2);
  };

  // Calculate grand total of all hours
  const calcGrandTotal = (): string => {
    return data
      .flatMap((cat) => cat.items)
      .reduce(
        (sum, row) => sum + row.hours.reduce((s, h) => s + parseFloat(h || '0'), 0),
        0
      )
      .toFixed(2);
  };

  // Memoized column totals for performance
  const columnTotals = useMemo(() => {
    const totals: string[] = [];
    for (let i = 0; i < 7; i++) {
      totals.push(calcColTotal(i));
    }
    return totals;
  }, [data]);

  // Memoized grand total for performance
  const grandTotal = useMemo(() => calcGrandTotal(), [data]);

  return {
    calcRowTotal,
    calcColTotal,
    calcGrandTotal,
    columnTotals,
    grandTotal,
  };
};