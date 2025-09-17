import PopupLayout from '../../../templates/popup/PopUpLayout';
import BaseTextField from '../../../atoms/inputField/BaseTextField';
import NumberField from '../../../atoms/inputField/NumberField';
import BaseBtn from '../../../atoms/button/BaseBtn';
import { registerUser } from '../../../../api/user';
import { UserRole } from '@tms/shared';
import { useEffect } from 'react';
import { CreateAccountFormSchema } from '../../../../validations';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/material';
import { useApiCall } from '../../../../hooks/api/useApiCall';
import PageLoading from '../../../molecules/loading/PageLoading';
import Divider from '@mui/material/Divider';
import { CreateAccountData } from '../../../../interfaces';

interface CreateAccountPopupProps {
  open: boolean;
  role: UserRole;
  onClose: () => void;
  onSuccess?: () => void; // Callback to refresh table data
}

function CreateAccountPopup({
  open,
  role,
  onClose,
  onSuccess,
}: CreateAccountPopupProps) {
  const title = `${role === 'admin' ? 'Create Admin' : 'Create Employee'}`;

  const { execute, isLoading, resetError } = useApiCall({
    loadingMessage: 'Creating account...',
    loadingVariant: 'overlay',
    successMessage: `${title} created successfully!`,
    errorMessage: 'Failed to create account. Please try again.',
    onSuccess: () => {
      // Call the onSuccess callback to refresh table data
      if (onSuccess) {
        onSuccess();
      }
      // Close the popup
      onClose();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateAccountData>({
    resolver: yupResolver(CreateAccountFormSchema),
    mode: 'onChange',
  });

  // Reset form when popup closes
  useEffect(() => {
    if (!open) {
      reset();
      resetError();
    }
    // We only want this to run when the popup visibility changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: CreateAccountData) => {
    await execute(() =>
      registerUser(
        {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          designation: data.designation,
          contactNumber: data.contactNumber,
        },
        role
      )
    );
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <PopupLayout open={open} title={title} onClose={onClose}>
      {isLoading && (
        <PageLoading
          message="Creating account..."
          variant="overlay"
          size="small"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 5,
            gap: 5,
          }}
        >
          <BaseTextField
            variant="outlined"
            label="Email"
            placeholder="Email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message || ' '}
            fullWidth
            disabled={isLoading}
          />

          <BaseTextField
            variant="outlined"
            label="First Name"
            placeholder="First Name"
            {...register('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName?.message || ' '}
            fullWidth
            disabled={isLoading}
          />
          <BaseTextField
            variant="outlined"
            label="Last Name"
            placeholder="Last Name"
            {...register('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName?.message || ' '}
            fullWidth
            disabled={isLoading}
          />
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

          <Box>
            <Divider />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              justifyContent: 'flex-end',
            }}
          >
            <BaseBtn
              type="button"
              onClick={handleCancel}
              variant="outlined"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              Cancel
            </BaseBtn>
            <BaseBtn
              sx={{ mt: 2 }}
              type="submit"
              disabled={!isValid || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </BaseBtn>
          </Box>
        </Box>
      </form>
    </PopupLayout>
  );
}
export default CreateAccountPopup;
