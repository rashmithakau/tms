import { Grid, Link, Box, Typography, Divider } from '@mui/material';
import AuthFormContainer from '../../../templates/form/AuthFormContainer';
import BaseTextField from '../../../atoms/inputField/BaseTextField';
import BaseBtn from '../../../atoms/button/BaseBtn';
import { LoginSchema } from '../../../../validations/auth';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../../api/auth';
import { UserRole } from '@tms/shared';
import { useApiCall } from '../../../../hooks/api/useApiCall';
import { useAuth } from '../../../../contexts/AuthContext';
import { LoginData } from '../../../../interfaces';

const LoginFormSection: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  
  const { execute, isLoading, error, resetError } = useApiCall({
    loadingMessage: 'Logging in...',
    loadingVariant: 'overlay',
    successMessage: 'Login successful!',
    errorMessage: 'Login failed. Please check your credentials.',
    onSuccess: async (response: any) => {
      try {
        const user = response.data.user;
        
        // Use the auth context to handle login
        authLogin({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          designation: user.designation,
          contactNumber: user.contactNumber,
          isChangedPwd: user.isChangedPwd,
        });

        

        // Add a longer delay to ensure state is updated and add logging
        console.log('Login successful, user role:', user.role, 'isChangedPwd:', user.isChangedPwd);
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!user.isChangedPwd) {
          console.log('Navigating to change password page');
          navigate('/change-password', { replace: true });
        } else {
          console.log('User has changed password, navigating based on role:', user.role);
          switch (user.role) {
            case UserRole.Admin:
              console.log('Navigating to admin dashboard');
              navigate('/admin', { replace: true });
              break;
            case UserRole.SuperAdmin:
              console.log('Navigating to superadmin dashboard');
              navigate('/superadmin', { replace: true });
              break;
            case UserRole.SupervisorAdmin:
              console.log('Navigating to admin dashboard (supervisor admin)');
              navigate('/admin', { replace: true });
              break;
            case UserRole.Emp:
              console.log('Navigating to employee dashboard');
              navigate('/employee', { replace: true });
              break;
            case UserRole.Supervisor:
              console.log('Navigating to employee dashboard (supervisor)');
              navigate('/employee', { replace: true });
              break;
            default:
              console.error('Unknown role:', user.role);
              break;
          }
        }
      } catch (error) {
        console.error('Error in onSuccess callback:', error);
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginData>({
    resolver: yupResolver(LoginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginData) => {
    try {
      await execute(() =>
        login({
          email: data.email,
          password: data.password,
        })
      );
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  

  return (
    <AuthFormContainer title="Login">
      <Grid sx={{ padding: 4 }}>
        {/* Login form  */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <BaseTextField
            label="Email"
            placeholder="Enter your email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ mb: 2 }}
            disabled={isLoading}
          />

          <BaseTextField
            label="Password"
            placeholder="Enter your password"
            type="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ mb: 3 }}
            disabled={isLoading}
            // Correct way to set maxLength in Material-UI
            slotProps={{
              input: {
                inputProps: { maxLength: 12 },
              },
            }}
          />
          {/* Login Button */}
          <BaseBtn
            type="submit"
            sx={{ mb: 2 }}
            disabled={!isValid || isLoading}
            fullWidth={true}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </BaseBtn>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              my: 2, // vertical margin
            }}
          >
            {/* Horizontal Divider */}
            <Divider sx={{ flexGrow: 1 }} />
            <Typography sx={{ mx: 2 }}>OR</Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>
          {/* Forget Password */}
          <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
            <Link
              component="button"
              onClick={() => navigate('/forgotpassword')}
              underline="hover"
              sx={{
                float: 'right',
                mt: 1,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.dark',
                },
              }}
              disabled={isLoading}
            >
              Forgot Password?
            </Link>
          </Grid>
        </form>
      </Grid>
    </AuthFormContainer>
  );
};
export default LoginFormSection;
