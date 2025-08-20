import { useEffect } from 'react';
import PopupLayout from '../templates/PopUpLayout';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, MenuItem } from '@mui/material';
import { useApiCall } from '../../hooks/useApiCall';
import PageLoading from '../molecules/PageLoading';
import { createMyTimesheet, updateMyTimesheet } from '../../api/timesheet';
import TimeField from '../atoms/inputFields/TimeField';
import DatePickerField from '../atoms/inputFields/DatePickerField';
import { timesheetFormSchema } from '../../validations/TimesheetFormSchema';
import { ITimesheetFormValues } from '../../interfaces/ITimesheetFormValues';
import { TimesheetStatus } from '@tms/shared';
import dayjs from 'dayjs';
import React, { useRef } from 'react';

interface TimesheetFormPopupProps {
  open: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSuccess: () => void;
  id?: string; // required in edit mode
  initial?: Partial<ITimesheetFormValues>;
}

export default function TimesheetFormPopup({
  open,
  mode,
  onClose,
  onSuccess,
  id,
  initial,
}: TimesheetFormPopupProps) {
  const isEdit = mode === 'edit';

  const { execute, isLoading, resetError } = useApiCall({
    loadingMessage: isEdit ? 'Updating timesheet...' : 'Creating timesheet...',
    loadingVariant: 'overlay',
    successMessage: isEdit ? 'Timesheet updated!' : 'Timesheet created!',
    errorMessage: isEdit
      ? 'Failed to update timesheet'
      : 'Failed to create timesheet',
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  // Convert time format from "12.30" to decimal hours (12.5)
  const convertTimeToDecimal = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split('.');
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);

    // Convert to decimal hours: hours + (minutes / 60)
    const decimalHours = hoursNum + minutesNum / 60;

    // Round to 2 decimal places to avoid floating-point precision issues
    return Math.round(decimalHours * 100) / 100;
  };

  // Convert decimal hours back to HH.MM format (e.g., 12.5 becomes "12.30")
  const convertDecimalToTimeFormat = (decimalHours: number): string => {
    if (!decimalHours || decimalHours === 0) return '';

    // Round to 2 decimal places to avoid floating-point precision issues
    const roundedHours = Math.round(decimalHours * 100) / 100;

    const hours = Math.floor(roundedHours);
    const minutes = Math.round((roundedHours - hours) * 60);

    // Ensure minutes don't exceed 59
    if (minutes >= 60) {
      return `${(hours + 1).toString().padStart(2, '0')}.00`;
    }

    // Format as HH.MM
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}.${formattedMinutes}`;
  };

  // Utility function to round decimal numbers to 2 decimal places
  const roundToTwoDecimals = (num: number): number => {
    return Math.round(num * 100) / 100;
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
  } = useForm<ITimesheetFormValues>({
    resolver: yupResolver(timesheetFormSchema),
    mode: 'onChange',
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      billableType: 'Non Billable',
      projectName: '',
      taskTitle: '',
      description: '',
      plannedHours: '',
      hoursSpent: '',
      status: TimesheetStatus.Draft,
    },
    values: {
      date: initial?.date || new Date().toISOString().slice(0, 10),
      billableType: (initial?.billableType as any) || 'Non Billable',
      projectName: initial?.projectName || '',
      taskTitle: initial?.taskTitle || '',
      description: initial?.description || '',
      plannedHours: initial?.plannedHours
        ? convertDecimalToTimeFormat(Number(initial.plannedHours))
        : '',
      hoursSpent: initial?.hoursSpent
        ? convertDecimalToTimeFormat(Number(initial.hoursSpent))
        : '',
      status: initial?.status || TimesheetStatus.Draft,
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        date: new Date().toISOString().slice(0, 10),
        billableType: 'Non Billable',
        projectName: '',
        taskTitle: '',
        description: '',
        plannedHours: '',
        hoursSpent: '',
        status: TimesheetStatus.Draft,
      });
      resetError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, id]);

  const onSubmit = async (data: ITimesheetFormValues) => {
    if (isEdit) {
      await execute(() =>
        updateMyTimesheet(
          id as string,
          {
            date: data.date,
            projectName: data.projectName,
            taskTitle: data.taskTitle,
            description: data.description,
            plannedHours: roundToTwoDecimals(
              convertTimeToDecimal(data.plannedHours || '')
            ),
            hoursSpent: roundToTwoDecimals(
              convertTimeToDecimal(data.hoursSpent || '')
            ),
            billableType: data.billableType,
            status: data.status,
          } as any
        )
      );
    } else {
      await execute(() =>
        createMyTimesheet({
          date: data.date,
          projectName: data.projectName,
          taskTitle: data.taskTitle,
          description: data.description,
          plannedHours: roundToTwoDecimals(
            convertTimeToDecimal(data.plannedHours || '')
          ),
          hoursSpent: roundToTwoDecimals(
            convertTimeToDecimal(data.hoursSpent || '')
          ),
          billableType: data.billableType,
          status: data.status,
        })
      );
    }
  };

  const dateRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>,
    nextFieldName: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      // Find the next field by name and focus it
      const nextField = document.querySelector(
        `[name="${nextFieldName}"]`
      ) as HTMLInputElement;
      if (nextField) {
        nextField.focus();
      }
    }
  };

  return (
    <PopupLayout
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Time Sheet' : 'Add Time Sheet'}
    >
      {isLoading && (
        <PageLoading
          message={isEdit ? 'Updating timesheet...' : 'Creating timesheet...'}
          variant="overlay"
          size="small"
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          marginTop={1}
        >
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DatePickerField
                ref={dateRef}
                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
                  handleKeyDown(e, 'projectName')
                }
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
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              handleKeyDown(e, 'taskTitle')
            }
            label="Project"
            placeholder="Project name"
            {...register('projectName')}
            error={!!errors.projectName}
            helperText={errors.projectName?.message || ' '}
          />
          <BaseTextField
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              handleKeyDown(e, 'description')
            }
            label="Task"
            placeholder="Task title"
            {...register('taskTitle')}
            error={!!errors.taskTitle}
            helperText={errors.taskTitle?.message || ' '}
          />
          <BaseTextField
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              handleKeyDown(e, 'plannedHours')
            }
            label="Description"
            placeholder="Description"
            multiline
            rows={3}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message || ' '}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TimeField
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e, 'hoursSpent')
              }
              label="Planned Hours"
              placeholder="e.g. 08.00"
              {...register('plannedHours')}
              error={!!errors.plannedHours}
              helperText={errors.plannedHours?.message || ' '}
            />
            <TimeField
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e, 'billableType')
              }
              label="Hours Spent"
              placeholder="e.g. 08.00"
              {...register('hoursSpent')}
              error={!!errors.hoursSpent}
              helperText={errors.hoursSpent?.message || ' '}
            />
          </Box>
          <BaseTextField
            select
            label="Billable Type"
            defaultValue={(initial?.billableType as any) || 'Non Billable'}
            {...register('billableType')}
            error={!!errors.billableType}
            helperText={errors.billableType?.message || ' '}
          >
            <MenuItem value="Billable">Billable</MenuItem>
            <MenuItem value="Non Billable">Non Billable</MenuItem>
          </BaseTextField>
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
