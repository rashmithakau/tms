import dayjs, { Dayjs } from 'dayjs';

export interface QuickDateButtonsProps {
  onDateRangeSelect: (start: Dayjs, end: Dayjs) => void;
  disabled?: boolean;
}