import { useEffect } from 'react';
import PopupLayout from '../templates/PopUpLayout';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, MenuItem } from '@mui/material';
import { useApiCall } from '../../hooks/useApiCall';
import PageLoading from '../molecules/PageLoading';
import { createMyTimesheet, updateMyTimesheet } from '../../api/timesheet';
import NumberField from '../atoms/inputFields/NumberField';

type FormValues = {
  date: string;
  projectName: string;
  taskTitle: string;
  description?: string;
  plannedHours?: number;
  hoursSpent?: number;
  billableType: 'Billable' | 'Non Billable';
};

const schema: yup.ObjectSchema<FormValues> = yup.object({
  date: yup.string().required(),
  projectName: yup.string().required('Project is required'),
  taskTitle: yup.string().required('Task is required'),
  description: yup.string().optional(),
  plannedHours: yup.number().min(0).optional(),
  hoursSpent: yup.number().min(0).optional(),
  billableType: yup.mixed<'Billable' | 'Non Billable'>().oneOf(['Billable', 'Non Billable']).required(),
});

interface TimesheetFormPopupProps {
  open: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSuccess: () => void;
  id?: string; // required in edit mode
  initial?: Partial<FormValues>;
}

export default function TimesheetFormPopup({ open, mode, onClose, onSuccess, id, initial }: TimesheetFormPopupProps) {
  const isEdit = mode === 'edit';

  const { execute, isLoading, resetError } = useApiCall({
    loadingMessage: isEdit ? 'Updating timesheet...' : 'Creating timesheet...',
    loadingVariant: 'overlay',
    successMessage: isEdit ? 'Timesheet updated!' : 'Timesheet created!',
    errorMessage: isEdit ? 'Failed to update timesheet' : 'Failed to create timesheet',
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      billableType: 'Non Billable',
      projectName: '',
      taskTitle: '',
      description: '',
    },
    values: {
      date: initial?.date || new Date().toISOString().slice(0, 10),
      billableType: (initial?.billableType as any) || 'Non Billable',
      projectName: initial?.projectName || '',
      taskTitle: initial?.taskTitle || '',
      description: initial?.description || '',
      plannedHours: initial?.plannedHours,
      hoursSpent: initial?.hoursSpent,
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
        plannedHours: undefined,
        hoursSpent: undefined,
      });
      resetError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, id]);

  const onSubmit = async (data: FormValues) => {
    if (isEdit) {
      await execute(() => updateMyTimesheet(id as string, {
        date: data.date,
        projectName: data.projectName,
        taskTitle: data.taskTitle,
        description: data.description,
        plannedHours: data.plannedHours,
        hoursSpent: data.hoursSpent,
        billableType: data.billableType,
      } as any));
    } else {
      await execute(() => createMyTimesheet({
        date: data.date,
        projectName: data.projectName,
        taskTitle: data.taskTitle,
        description: data.description,
        plannedHours: data.plannedHours,
        hoursSpent: data.hoursSpent,
        billableType: data.billableType,
      }));
    }
  };

  return (
    <PopupLayout
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Time Sheet' : 'Add Time Sheet'}
      
    >
      {isLoading && (
        <PageLoading message={isEdit ? 'Updating timesheet...' : 'Creating timesheet...'} variant="overlay" size="small" />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <BaseTextField type="date" label="Date" {...register('date')} error={!!errors.date} helperText={errors.date?.message || ' '} />
          <BaseTextField label="Project" placeholder="Project name" {...register('projectName')} error={!!errors.projectName} helperText={errors.projectName?.message || ' '} />
          <BaseTextField label="Task" placeholder="Task title" {...register('taskTitle')} error={!!errors.taskTitle} helperText={errors.taskTitle?.message || ' '} />
          <BaseTextField label="Description" placeholder="Description" multiline rows={3} {...register('description')} error={!!errors.description} helperText={errors.description?.message || ' '} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <NumberField  label="Planned Hours" placeholder="e.g. 8" {...register('plannedHours')} error={!!errors.plannedHours} helperText={errors.plannedHours?.message || ' '} />
            <NumberField type="number" label="Hours Spent" placeholder="e.g. 8" {...register('hoursSpent')} error={!!errors.hoursSpent} helperText={errors.hoursSpent?.message || ' '} />
          </Box>
          <BaseTextField select label="Billable Type" defaultValue={(initial?.billableType as any) || 'Non Billable'} {...register('billableType')} error={!!errors.billableType} helperText={errors.billableType?.message || ' '}>
            <MenuItem value="Billable">Billable</MenuItem>
            <MenuItem value="Non Billable">Non Billable</MenuItem>
          </BaseTextField>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
            <BaseBtn type="button" variant="outlined" onClick={onClose}>Cancel</BaseBtn>
            <BaseBtn type="submit" disabled={!isValid}>{isEdit ? 'Save' : 'Create'}</BaseBtn>
          </Box>
        </Box>
      </form>
    </PopupLayout>
  );
}


