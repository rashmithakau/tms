import React from 'react';
import CenterContainerLayout from '../components/templates/CenterContainerLayout';
import PasswordReset from '../components/organisms/PasswordReset';

const PasswordResetPage: React.FC = () => {
  return( <CenterContainerLayout>
    <PasswordReset />
  </CenterContainerLayout>
  );
};

export default PasswordResetPage;
