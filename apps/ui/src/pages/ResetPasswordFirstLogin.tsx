import React from 'react';
import CenterContainerLayout from '../components/templates/layout/CenterContainerLayout';
import ResetPasswordFirstLoginForm from '../components/organisms/auth/password/ResetPasswordFirstLoginForm';

const ResetPasswordFirstLogin: React.FC = () => {
  return (
    <CenterContainerLayout>
      <ResetPasswordFirstLoginForm />
    </CenterContainerLayout>
  );
};

export default ResetPasswordFirstLogin;
