import AuthFormContainer from '../../styles/AuthFormContainer';
import { Grid, Box } from '@mui/material';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import WebSiteLogo from '../../assets/images/WebSiteLogo.png';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PasswordResetChangePasswordPageSchema from '../../validations/PasswordResetChangePasswordPageSchema';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { verifyPasswordResetToken, resetPassword } from '../../api/auth';

type SetPasswordData = {
  newPassword: string;
  confirmPassword: string;
};

const ResetChangePassword: React.FC = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [verificationCodeId, setVerificationCodeId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SetPasswordData>({
    resolver: yupResolver(PasswordResetChangePasswordPageSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      const verificationCode = searchParams.get('verificationCode');

      if (!token || !verificationCode) {
        setVerificationError(
          'Invalid reset link. Please request a new password reset.'
        );
        setIsVerifying(false);
        return;
      }

      try {
        const response = await verifyPasswordResetToken(token);
        setUserInfo(response.data.user);
        setVerificationCodeId(response.data.verificationCodeId);
        setIsVerifying(false);
      } catch (err: any) {
        setVerificationError(
          err.response?.data?.message ||
            'Invalid or expired reset link. Please request a new password reset.'
        );
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const onSubmit = async (data: SetPasswordData) => {
    if (!verificationCodeId) {
      setError(
        'Verification code not found. Please use the reset link from your email.'
      );
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await resetPassword({
        newPassword: data.newPassword,
        verificationCodeId: verificationCodeId,
        confirmNewPassword: data.confirmPassword,
      });
      setMessage('Password reset successfully! Redirecting to login...');

      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Failed to reset password. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };
  if (isVerifying) {
    return (
      <AuthFormContainer title="Verifying Reset Link" icon={WebSiteLogo}>
        <Grid sx={{ padding: 3, textAlign: 'center' }}>
          <Box>Verifying your reset link...</Box>
        </Grid>
      </AuthFormContainer>
    );
  }

  if (verificationError) {
    return (
      <AuthFormContainer title="Reset Link Error" icon={WebSiteLogo}>
        <Grid sx={{ padding: 3, textAlign: 'center' }}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'error.light',
              color: 'error.contrastText',
              borderRadius: 1,
              mb: 2,
            }}
          >
            {verificationError}
          </Box>
          <BaseBtn onClick={() => navigate('/forgotpassword')} fullWidth>
            Request New Reset Link
          </BaseBtn>
        </Grid>
      </AuthFormContainer>
    );
  }

  return (
    <AuthFormContainer title="Reset Password" icon={WebSiteLogo}>
      <Grid sx={{ paddingX: 3 }}>
        {userInfo && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: 'info.dark',
              color: 'info.contrastText',
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            Reset password for: {userInfo.email}
          </Box>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <BaseTextField
            label="New Password"
            type="password"
            sx={{ mb: 2 }}
            fullWidth
            {...register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <BaseTextField
            label="Confirm Password"
            type="password"
            sx={{ mb: 2 }}
            fullWidth
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <BaseBtn
            type="submit"
            sx={{ mb: 2 }}
            disabled={!isValid || isSubmitting || isLoading}
            fullWidth={true}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </BaseBtn>

          {message && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'success.light',
                color: 'success.contrastText',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              {message}
            </Box>
          )}

          {error && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'error.light',
                color: 'error.contrastText',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              {error}
            </Box>
          )}
        </form>
      </Grid>
    </AuthFormContainer>
  );
};

export default ResetChangePassword;
