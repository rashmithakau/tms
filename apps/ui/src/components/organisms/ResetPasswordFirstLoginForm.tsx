import AuthFormContainer from '../../styles/AuthFormContainer';
import { Grid } from '@mui/material';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import WebSiteLogo from '../../assets/images/WebSiteLogo.png';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ResetPasswordFirstLoginSchema from '../../validations/ResetPasswordFirstLoginSchema';
import { changePwdFirstLogin } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@tms/shared';

type SetPasswordData = {
  newPassword: string;
  confirmPassword: string;
};
const ResetPasswordFirstLoginForm: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SetPasswordData>({
    resolver: yupResolver(ResetPasswordFirstLoginSchema),
    mode: 'onChange',
  });
  const onSubmit = async (data: SetPasswordData) => {
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('_id');
    if (!userId) {
      console.error('User ID not found in local storage');
      return;
    }
    const response = await changePwdFirstLogin({
      userId,
      newPassword: data.newPassword,
    });

    switch (role) {
      case UserRole.Admin:
        navigate('/admin');
        break;
      case UserRole.SuperAdmin:
        navigate('/superadmin');
        break;
      case UserRole.Emp:
        navigate('/employee');
        break;
      case UserRole.Supervisor:
        navigate('/employee');
        break;
    }
  };
  return (
    <AuthFormContainer title="Set Password" icon={WebSiteLogo}>
      <Grid sx={{ padding: 3, mt: -2 }}>
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

export default ResetPasswordFirstLoginForm;
