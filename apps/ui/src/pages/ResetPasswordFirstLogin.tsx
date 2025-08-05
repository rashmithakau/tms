import React from 'react';
import CenterContainerLayout from '../components/templates/CenterContainerLayout';
import ResetPasswordFirstLoginForm from '../components/organisms/ResetPasswordFirstLoginForm';

const ResetPasswordFirstLogin: React.FC = () => {
  return (
    <CenterContainerLayout>
      <ResetPasswordFirstLoginForm />
    </CenterContainerLayout>
  );
};

export default ResetPasswordFirstLogin;
