import AuthFormContainer from '../../styles/AuthFormContainer';
import { Box, Grid } from '@mui/material';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import WebSiteLogo from '../../assets/images/WebSiteLogo.png';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ResetPasswordFormSchema from '../../validations/ResetPasswordFormSchema';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

type SetPasswordData = {
  email: string;
};

const PasswordReset: React.FC = () => {
    const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SetPasswordData>({
    resolver: yupResolver(ResetPasswordFormSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: SetPasswordData) => {
    // Handle password reset logic here
    navigate('/resetpasswordchange');
  };

  return (
    <AuthFormContainer
      title="Password Reset"
      description="Enter Email For Reset Password"
      icon={WebSiteLogo}
    >
      <Box sx={{ padding: 3 , maxWidth: 400}}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <BaseTextField
            label="Email"
            type="email"
            sx={{ mb: 2 }}
            fullWidth
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message || ' '}
          />
          <BaseBtn
            type="submit"
            sx={{ mb: 2 }}
            disabled={!isValid || isSubmitting}
            fullWidth
            
          >
            Confirm
          </BaseBtn>
        </form>
        <Box sx={{textAlign: 'center', display: 'block', mt: 2}}>
          <Link to="/">Back to Login</Link>
        </Box>
      </Box>
    </AuthFormContainer>
  );
};

export default PasswordReset;
