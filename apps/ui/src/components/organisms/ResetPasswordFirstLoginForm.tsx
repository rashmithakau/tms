import AuthFormContainer from '../../styles/AuthFormContainer';
import { Grid } from '@mui/material';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import WebSiteLogo from '../../assets/images/WebSiteLogo.svg';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ResetPasswordFirstLoginSchema from '../../validations/ResetPasswordFirstLoginSchema';

type SetPasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
const ResetPasswordFirstLoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SetPasswordData>({
    resolver: yupResolver(ResetPasswordFirstLoginSchema),
    mode: 'onChange',
  });
  const onSubmit = (data: SetPasswordData) => {
    // Handle login logic here
  };
  return (
    <AuthFormContainer title="Set Password" icon={WebSiteLogo}>
      <Grid sx={{ padding: 3, mt: -2 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Form fields for setting a new password */}
          <BaseTextField
            label="Current Password"
            type="password"
            sx={{ mb: 2 }}
            {...register('currentPassword')}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
          />
          <BaseTextField
            label="New Password"
            type="password"
            sx={{ mb: 2 }}
            {...register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <BaseTextField
            label="Confirm Password"
            type="password"
            sx={{ mb: 2 }}
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <BaseBtn
            type="submit"
            sx={{ mb: 2 }}
            disabled={!isValid || isSubmitting}
          >
            Save
          </BaseBtn>
        </form>
      </Grid>
    </AuthFormContainer>
  );
};

export default ResetPasswordFirstLoginForm;
