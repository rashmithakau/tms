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

type LoginData = {
  email: string;
  password: string;
};

const LoginFormSection: React.FC = () => {
  const navigate = useNavigate();

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
      let isAuthenticated = false;
      // Clear local storage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      localStorage.removeItem('_id');
      localStorage.removeItem('isChangedPwd');
      localStorage.removeItem('role');
      localStorage.removeItem('designation');


      const response = await login({
        email: data.email,
        password: data.password,
      });
      const user = response.data.user;

      const firstName = user.firstName;
      const lastName = user.lastName;
      const _id = user._id;
      const isChangedPwd = user.isChangedPwd;
      const role = user.role;
      const designation = user.designation;

      if (user.exists) {
        isAuthenticated = true;
      }

      localStorage.setItem('isAuthenticated', isAuthenticated.toString());
      localStorage.setItem('firstName', firstName);
      localStorage.setItem('lastName', lastName);
      localStorage.setItem('_id', _id);
      localStorage.setItem('role', role);
      localStorage.setItem('designation', designation);

      console.log('Login successful:', user);

      console.log('User Role:', role);

      if (!isChangedPwd) {
        navigate('/change-password');
      } else {
        switch (role) {
          case UserRole.Admin:
            navigate('/admin');
            break;
          case UserRole.SuperAdmin:
            console.log('Navigating to SuperAdmin');
            navigate('/superadmin');
            break;
          case UserRole.Emp:
            navigate('/employee');
            break;
          case UserRole.Supervisor:
            navigate('/supervisor');
            break;
        }
      }
    } catch (error) {
      console.error('An error occurred during login:', error);
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
