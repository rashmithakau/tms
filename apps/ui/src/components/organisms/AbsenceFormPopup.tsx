import { Controller, useForm } from 'react-hook-form';
import BaseBtn from '../atoms/buttons/BaseBtn';
import PopupLayout from '../templates/PopUpLayout';
import Box from '@mui/material/Box';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import { MenuItem } from '@mui/material';
import { absenceActivity } from '@tms/shared';
import DatePickerField from '../atoms/inputFields/DatePickerField';
import dayjs from 'dayjs';
import { Absence, createAbsence } from '../../api/absence';

interface AbsenceFormPopupProps {
  initial?: {
    absenceType?: string;
    activityType?: string;
    date?: Date;
  };
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isEdit: boolean;
}

const convertTimeToDecimal = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split('.');
  const hoursNum = parseInt(hours, 10);
  const minutesNum = parseInt(minutes, 10);

  const decimalHours = hoursNum + minutesNum / 60;

  return Math.round(decimalHours * 100) / 100;
};

const roundToTwoDecimals = (num: number): number => {
  return Math.round(num * 100) / 100;
};

const onSubmit = async (data: Absence) => {
  createAbsence({
    date: data.date,
    absenceActivity: data.absenceActivity,
    hoursSpent: roundToTwoDecimals(
      convertTimeToDecimal(data.hoursSpent?.toString() || '0')
    ),
  });
};

function AbsenceFormPopup({
  initial,
  open,
  onClose,
  onSubmit,
  isEdit,
}: AbsenceFormPopupProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      absenceType: initial?.absenceType || 'Vacation',
      activityType: initial?.activityType || 'Meeting',
      date: initial?.date || null,
    },
  });

  return (
    <PopupLayout
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Absence' : 'Create Absence'}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 1 }}
        >
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DatePickerField
                label="Date"
                value={field.value ? dayjs(field.value) : null}
                onChange={(newValue: dayjs.Dayjs | null) =>
                  field.onChange(newValue ? newValue.format('YYYY-MM-DD') : '')
                }
                format="YYYY-MM-DD"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: !!errors.date,
                    helperText: errors.date?.message || ' ',
                  },
                }}
              />
            )}
          />
          <BaseTextField
            select
            label="Acticity Type"
            defaultValue={initial?.activityType as any}
          >
            {Object.values(absenceActivity).map((activity) => (
              <MenuItem key={activity} value={activity}>
                {activity}
              </MenuItem>
            ))}
          </BaseTextField>
          {/* Buttons */}
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}
          >
            <BaseBtn type="button" variant="outlined" onClick={onClose}>
              Cancel
            </BaseBtn>
            <BaseBtn type="submit" disabled={!isValid}>
              {isEdit ? 'Save' : 'Create'}
            </BaseBtn>
          </Box>
        </Box>
      </form>
    </PopupLayout>
  );
}

export default AbsenceFormPopup;
