import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { IDatePickerFieldProps } from 'apps/ui/src/interfaces/IDatePickerFieldProps';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const DatePickerField = React.forwardRef<HTMLDivElement, IDatePickerFieldProps>(
  ({ label, value, onChange, minDate, maxDate, format = 'YYYY-MM-DD', slotProps, ...rest }, ref) => {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label={label}
          value={value}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          format={format}
          slotProps={{
            textField: {
              fullWidth: true,
            },
            ...slotProps,
          }}
          ref={ref}
          {...rest}
        />
      </LocalizationProvider>
    );
  }
);

DatePickerField.displayName = 'DatePickerField';

export default DatePickerField;


