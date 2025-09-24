export interface ICalendarProps {
  title?: string;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  highlightToday?: boolean;
}
