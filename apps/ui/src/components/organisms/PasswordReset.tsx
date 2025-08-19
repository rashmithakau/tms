import AuthFormContainer from '../../styles/AuthFormContainer';
import { Box, Grid } from '@mui/material';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import WebSiteLogo from '../../assets/images/WebSiteLogo.png';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ResetPasswordFormSchema from '../../validations/ResetPasswordFormSchema';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from '../../api/auth';
import { useState } from 'react';

type SetPasswordData = {
  email: string;
};

const PasswordReset: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    const {
      register,
      handleSubmit,
      formState: { errors, isValid, isSubmitting },
    } = useForm<SetPasswordData>({
      resolver: yupResolver(ResetPasswordFormSchema),
      mode: 'onChange',
    });

    const onSubmit = async (data: SetPasswordData) => {
      setIsLoading(true);
      setError('');
      setMessage('');
      
      try {
        await sendPasswordResetEmail(data.email);
        setMessage('Password reset email sent successfully! Check your email for the reset link.');
        // Don't navigate immediately, let user see the success message
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to send password reset email. Please try again.');
      } finally {
        setIsLoading(false);
      }
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
            disabled={!isValid || isSubmitting || isLoading}
            fullWidth
            
          >
            {isLoading ? 'Sending...' : 'Confirm'}
          </BaseBtn>
          
          {message && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'success.light', 
              color: 'success.contrastText',
              borderRadius: 1,
              textAlign: 'center'
            }}>
              {message}
            </Box>
          )}
          
          {error && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'error.light', 
              color: 'error.contrastText',
              borderRadius: 1,
              textAlign: 'center'
            }}>
              {error}
            </Box>
          )}
        </form>
        <Box sx={{textAlign: 'center', display: 'block', mt: 2}}>
          <Link to="/">Back to Login</Link>
        </Box>
      </Box>
    </AuthFormContainer>
  );
};

export default PasswordReset;
