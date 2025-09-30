import AuthFormContainer from '../../../templates/form/AuthFormContainer';
import { Grid } from '@mui/material';
import BaseTextField from '../../../atoms/common/inputField/BaseTextField';
import WebSiteLogo from '../../../../assets/images/WebSiteLogo.png';
import BaseBtn from '../../../atoms/common/button/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ResetPasswordFirstLoginSchema } from '../../../../validations/auth';
import { changePwdFirstLogin } from '../../../../api/auth';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@tms/shared';
import { SetPasswordData } from '../../../../interfaces';
import { useAuth } from '../../../../contexts/AuthContext';

const ResetPasswordFirstLoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SetPasswordData>({
    resolver: yupResolver(ResetPasswordFirstLoginSchema),
    mode: 'onChange',
  });
  
  const onSubmit = async (data: SetPasswordData) => {
    if (!authState.user) {
      console.error('User not found in auth context');
      return;
    }
    
    const response = await changePwdFirstLogin({
      userId: authState.user._id,
      newPassword: data.newPassword,
    });

    switch (authState.user.role) {
      case UserRole.Admin:
      case UserRole.SupervisorAdmin:
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
