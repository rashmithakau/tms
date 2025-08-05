import { Grid, Link, Box, Typography, Divider } from '@mui/material';
import AuthFormContainer from '../../styles/AuthFormContainer';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import BaseBtn from '../atoms/buttons/BaseBtn';
import theme from '../../styles/theme';
import LoginSchema from '../../validations/LoginSchema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

type LoginData = {
  email: string;
  password: string;
};

const LoginFormSection: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginData>({
    resolver: yupResolver(LoginSchema),
    mode: 'onChange', // enables real-time validation
  });

  const onSubmit = (data: LoginData) => {
   // Handle login logic here
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
                fontFamily: theme.typography.fontFamily,
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
