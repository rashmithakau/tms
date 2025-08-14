import { Grid, Link, Box, Typography, Divider } from '@mui/material';
import AuthFormContainer from '../../styles/AuthFormContainer';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import BaseBtn from '../atoms/buttons/BaseBtn';
import LoginSchema from '../../validations/LoginSchema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { AppDispatch } from '../../store/store';
import { fetchUser } from '../../store/slices/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

type LoginData = {
  email: string;
  password: string;
};

const LoginFormSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user.user); // Adjusted selector

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginData>({
    resolver: yupResolver(LoginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginData) => {
    try {
      // Clear local storage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('_id');
  
      // Dispatch fetchUser action
      await dispatch(fetchUser({ email: data.email, password: data.password }));
  
      // Retrieve authentication status and user role from local storage
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const userRole = localStorage.getItem('userRole');
  
      console.log('Login from section:', isAuthenticated, userRole);
      console.log('Redux user state:', user); // Debugging user state
  
      // Check if the user is authenticated
      if (isAuthenticated) {
        // Ensure user object exists and check isChangedPwd
        if (user && typeof user.isChangedPwd === 'boolean') {
          if (!user.isChangedPwd) {
            // Navigate to change password page if password is not changed
            navigate('/change-password');
          } else {
            // Navigate to the dashboard or appropriate page
            if( userRole === 'admin') {
            navigate('/admin');
            }else if(userRole === 'superAdmin') {
              navigate('/superAdmin');
            }

          }
        } else {
          console.error("User is undefined or isChangedPwd is missing");
        }
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
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
          />

          <BaseTextField
            label="Password"
            placeholder="Enter your password"
            type="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ mb: 3 }}
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
            disabled={!isValid || isSubmitting}
            fullWidth={true}
          >
            Login
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
              href="ForgotPassword"
              underline="hover"
              sx={{
                float: 'right',
                mt: 1,
              }}
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
