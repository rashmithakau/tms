import PopupLayout from '../../../templates/popup/PopUpLayout';
import BaseTextField from '../../../atoms/common/inputField/BaseTextField';
import NumberField from '../../../atoms/common/inputField/NumberField';
import BaseBtn from '../../../atoms/common/button/BaseBtn';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useApiCall } from '../../../../hooks/api/useApiCall';
import PageLoading from '../../../molecules/common/loading/PageLoading';
import Divider from '@mui/material/Divider';
import { updateUser } from '../../../../api/user';
import * as yup from 'yup';

type EditAccountData = {
  designation: string;
  contactNumber: string;
  status: 'Active' | 'Inactive';
};

const schema = yup.object({
  designation: yup.string().trim().required('Designation is required'),
  contactNumber: yup.string().trim().required('Contact number is required'),
  status: yup.mixed<'Active' | 'Inactive'>().oneOf(['Active', 'Inactive']).required('Status is required'),
});

export default function EditAccountPopup({
  open,
  onClose,
  user,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  user: any | null;
  onSuccess?: () => void;
}) {
  const theme = useTheme();
  const { execute, isLoading, resetError } = useApiCall({
    loadingMessage: 'Updating account...',
    loadingVariant: 'overlay',
    successMessage: 'Account updated successfully!',
    errorMessage: 'Failed to update account. Please try again.',
    onSuccess: () => {
      if (onSuccess) onSuccess();
      onClose();
    },
  });

  const { register, handleSubmit, reset, setValue, control, formState: { errors, isValid } } = useForm<EditAccountData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      designation: '',
      contactNumber: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (open && user) {
      setValue('designation', (user as any).designation ?? '');
      setValue('contactNumber', (user as any).contactNumber ?? '');
      const isActive = (user as any).status === 'Active' || (user as any).status === true;
      setValue('status', isActive ? 'Active' : 'Inactive');
    }
    if (!open) {
      reset();
      resetError();
    }
  }, [open, user]);

  const onSubmit = async (data: EditAccountData) => {
    if (!user?.id) return;
    await execute(() => updateUser(user.id, {
      designation: data.designation,
      contactNumber: data.contactNumber,
      status: data.status === 'Active',
    }));
  };

  return (
    <PopupLayout open={open} title="Edit Account" onClose={onClose}>
      {isLoading && (
        <PageLoading message="Updating account..." variant="overlay" size="small" />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box style={{ display: 'flex', flexDirection: 'column', padding: 5, gap: 5 }}>
          <BaseTextField
            variant="outlined"
            label="Designation"
            placeholder="Designation"
            {...register('designation')}
            error={!!errors.designation}
            helperText={errors.designation?.message || ' '}
            fullWidth
            disabled={isLoading}
          />

          <NumberField
            variant="outlined"
            label="Contact Number"
            placeholder="Contact Number"
            maxDigits={10}
            {...register('contactNumber')}
            error={!!errors.contactNumber}
            helperText={errors.contactNumber?.message || ' '}
            fullWidth
            disabled={isLoading}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!errors.status}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  label="Status"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                        backgroundColor: theme.palette.background.default,
                      },
                    },
                  }}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
                <FormHelperText>{errors.status?.message || ' '}</FormHelperText>
              </FormControl>
            )}
          />

          <Box>
            <Divider />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'flex-end' }}>
            <BaseBtn type="button" onClick={onClose} variant="outlined" disabled={isLoading} sx={{ mt: 2 }}>
              Cancel
            </BaseBtn>
            <BaseBtn sx={{ mt: 2 }} type="submit" disabled={!isValid || isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </BaseBtn>
          </Box>
        </Box>
      </form>
    </PopupLayout>
  );
}


