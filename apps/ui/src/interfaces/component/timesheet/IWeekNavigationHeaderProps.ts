export interface IWeekNavigationHeaderProps {
  employeeName: string;
  currentWeekStart: Date;
  weekEndDate: Date;
  onPrev: () => void;
  onNext: () => void;
}