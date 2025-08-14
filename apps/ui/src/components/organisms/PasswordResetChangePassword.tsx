import AuthFormContainer from '../../styles/AuthFormContainer';
import { Grid } from '@mui/material';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import WebSiteLogo from '../../assets/images/WebSiteLogo.png';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PasswordResetChangePasswordPageSchema from '../../validations/PasswordResetChangePasswordPageSchema';
import { useNavigate } from 'react-router-dom';
type SetPasswordData = {
  newPassword: string;
  confirmPassword: string;
};
const PasswordResetChangePassword: React.FC = () => {
    const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SetPasswordData>({
    resolver: yupResolver(PasswordResetChangePasswordPageSchema),
    mode: 'onChange',
  });
  const onSubmit = (data: SetPasswordData) => {
    navigate('/');
  };
  return (
    <AuthFormContainer title="Change Password" icon={WebSiteLogo}>
      <Grid sx={{ padding: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Form fields for setting a new password */}
       
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
            fullWidth={true}
          >
            Save
          </BaseBtn>
        </form>
      </Grid>
    </AuthFormContainer>
  );
};

export default PasswordResetChangePassword;