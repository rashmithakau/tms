import React from 'react';
import { Dayjs } from 'dayjs';

export interface IDatePickerFieldProps {
  label?: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  format?: string;
  slotProps?: any;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  [key: string]: any;
}




