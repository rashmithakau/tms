import { useMemo } from 'react';

export interface TimesheetItem {
  work?: string;
  projectId?: string;
  hours: string[];
  descriptions: string[];
}

export interface TimesheetData {
  category: 'Project' | 'Absence';
  items: TimesheetItem[];
}

export const useTimesheetCalculations = (data: TimesheetData[]) => {
  const calculations = useMemo(() => {
    // Calculate row total for specific row
    const calcRowTotal = (hours: string[]): string =>
      hours.reduce((sum, h) => sum + parseFloat(h || '0'), 0).toFixed(2);

    // Calculate column total for specific day
    const calcColTotal = (colIndex: number): string =>
      data
        .flatMap((cat) => cat.items)
        .reduce((sum, row) => sum + parseFloat(row.hours[colIndex] || '0'), 0)
        .toFixed(2);

    // Calculate grand total of all hours
    const calcGrandTotal = (): string =>
      data
        .flatMap((cat) => cat.items)
        .reduce(
          (sum, row) =>
            sum + row.hours.reduce((s, h) => s + parseFloat(h || '0'), 0),
          0
        )
        .toFixed(2);

    // Get all column totals
    const getColumnTotals = (daysCount: number): string[] =>
      Array.from({ length: daysCount }, (_, index) => calcColTotal(index));

    // Calculate category totals
    const getCategoryTotals = () =>
      data.map((category) => ({
        category: category.category,
        total: category.items
          .reduce(
            (sum, item) =>
              sum + item.hours.reduce((s, h) => s + parseFloat(h || '0'), 0),
            0
          )
          .toFixed(2),
      }));

    return {
      calcRowTotal,
      calcColTotal,
      calcGrandTotal,
      getColumnTotals,
      getCategoryTotals,
    };
  }, [data]);

  return calculations;
};