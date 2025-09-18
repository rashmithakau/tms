export interface ITimesheetTotalRowProps {
  days: { day: string; date: Date }[];
  calcColTotal: (colIndex: number) => string;
  calcGrandTotal: () => string;
}