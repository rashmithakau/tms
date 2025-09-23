import React from 'react';
import { Box, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import  {DatePickerAtom}  from '../../../atoms/report';
import { DateRangePickerProps } from '../../../../interfaces/report/filter';

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      gap: 2,
      
    }}
  >
    {/* Start Date */}
    <Box>
      <DatePickerAtom
        label="Start Date"
        value={startDate || null}
        onChange={onStartDateChange}
        disabled={disabled}
      />
      {!startDate && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Optional: choose a start date
        </Typography>
      )}
    </Box>
    {/* End Date */}
    <Box>
      <DatePickerAtom
        label="End Date"
        value={endDate || null}
        onChange={onEndDateChange}
        disabled={disabled}
        minDate={startDate ? dayjs(startDate) : undefined}
      />
      {!endDate && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Optional: choose an end date
        </Typography>
      )}
    </Box>
  </Box>
);

export default DateRangePicker;
