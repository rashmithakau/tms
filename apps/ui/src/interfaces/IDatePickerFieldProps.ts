import { Dayjs } from 'dayjs';
import { BaseDatePickerProps } from '@mui/x-date-pickers/DatePicker';

export interface IDatePickerFieldProps extends Omit<BaseDatePickerProps<Dayjs>, 'onChange' | 'value'> {
  label?: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  format?: string;
}




