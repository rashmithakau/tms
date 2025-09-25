import  { Dayjs } from 'dayjs';
export interface DatePickerAtomProps {
  label: string;
  value: string | null;
  onChange: (date: Dayjs | null) => void;
  disabled?: boolean;
  minDate?: Dayjs;
}


export interface DateRangePickerProps {
  startDate: string | null | undefined;
  endDate: string | null | undefined;
  onStartDateChange: (date: Dayjs | null) => void;
  onEndDateChange: (date: Dayjs | null) => void;
  disabled?: boolean;
}
