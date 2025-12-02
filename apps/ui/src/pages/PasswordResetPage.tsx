import React from 'react';
import CenterContainerLayout from '../components/templates/layout/CenterContainerLayout';
import PasswordReset from '../components/organisms/auth/password/PasswordReset';

const PasswordResetPage: React.FC = () => {
  return( <CenterContainerLayout>
    <PasswordReset />
  </CenterContainerLayout>
  );
};

export default PasswordResetPage;
