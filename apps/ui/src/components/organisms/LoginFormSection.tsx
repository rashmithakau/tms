import { Grid, Link, Box, Typography, Divider } from '@mui/material';
import AuthFormContainer from '../../styles/AuthFormContainer';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import BaseBtn from '../atoms/buttons/BaseBtn';
import LoginSchema from '../../validations/LoginSchema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { UserRole } from '@tms/shared';
import { useApiCall } from '../../hooks/useApiCall';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

type LoginData = {
  email: string;
  password: string;
};

const LoginFormSection: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  
  const { execute, isLoading, error, resetError } = useApiCall({
    loadingMessage: 'Logging in...',
    loadingVariant: 'overlay',
    successMessage: 'Login successful!',
    errorMessage: 'Login failed. Please check your credentials.',
    onSuccess: async (response) => {
      try {
        console.log('onSuccess callback started');
        const user = response.data.user;
        
        // Use the auth context to handle login
        authLogin({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          designation: user.designation,
          isChangedPwd: user.isChangedPwd,
        });

        console.log('Login successful:', user);
        console.log('User Role:', user.role);
        console.log('Is Changed Password:', user.isChangedPwd);

        // Add a small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!user.isChangedPwd) {
          console.log('Navigating to change-password');
          navigate('/change-password', { replace: true });
        } else {
          console.log('Navigating based on role:', user.role);
          switch (user.role) {
            case UserRole.Admin:
              console.log('Navigating to Admin dashboard');
              navigate('/admin', { replace: true });
              break;
            case UserRole.SuperAdmin:
              console.log('Navigating to SuperAdmin dashboard');
              navigate('/superadmin', { replace: true });
              break;
            case UserRole.Emp:
              console.log('Navigating to Employee dashboard');
              navigate('/employee', { replace: true });
              break;
            case UserRole.Supervisor:
              console.log('Navigating to Supervisor dashboard');
              navigate('/supervisor', { replace: true });
              break;
            default:
              console.error('Unknown role:', user.role);
              break;
          }
        }
        console.log('Navigation completed');
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
      console.log('Form submission started');
      await execute(() =>
        login({
          email: data.email,
          password: data.password,
        })
      );
      console.log('Form submission completed');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Debug effect to log current state
  useEffect(() => {
    console.log('LoginFormSection mounted');
  }, []);

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
