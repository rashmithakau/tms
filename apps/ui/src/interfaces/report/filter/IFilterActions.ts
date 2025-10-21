import { Dayjs } from 'dayjs';

export interface FilterActionsProps {
  onReset: () => void;
  onDateRangeSelect: (start: Dayjs, end: Dayjs) => void;
  disabled?: boolean;
}