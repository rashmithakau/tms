import { useMemo } from 'react';
import { TimesheetData } from '../../interfaces/hooks/timesheet';

export const useTimesheetCalculations = (data: TimesheetData[]) => {

  // Convert HH.MM format to decimal hours (e.g., 03.20 -> 3.333)
  const parseTimeToDecimal = (timeStr: string): number => {
    if (!timeStr || timeStr === '00.00') return 0;
    
    const parts = timeStr.split('.');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    
    return hours + (minutes / 60);
  };

  // Convert decimal hours back to HH.MM format (e.g., 3.333 -> 03.20)
  const formatDecimalToTime = (decimalHours: number): string => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    
    return `${hours.toString().padStart(2, '0')}.${minutes.toString().padStart(2, '0')}`;
  };

  const formatTotal = (value: number): string => {
    return formatDecimalToTime(value);
  };

  const calcRowTotal = (hours: string[]): string => {
    const total = hours.reduce((sum, h) => sum + parseTimeToDecimal(h || '0'), 0);
    return formatTotal(total);
  };

  const calcColTotal = (colIndex: number): string => {
    const total = data
      .flatMap((cat) => cat.items)
      .reduce((sum, row) => sum + parseTimeToDecimal(row.hours[colIndex] || '0'), 0);
    return formatTotal(total);
  };

  
  const calcGrandTotal = (): string => {
    const total = data
      .flatMap((cat) => cat.items)
      .reduce(
        (sum, row) => sum + row.hours.reduce((s, h) => s + parseTimeToDecimal(h || '0'), 0),
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