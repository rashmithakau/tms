import React from 'react';
import CenterContainerLayout from '../components/templates/layout/CenterContainerLayout';
import ResetChangePassword from '../components/organisms/authentication/password/ResetChangePassword';

const ResetChangePasswordPage: React.FC = () => {
  return (
    <CenterContainerLayout>
      <ResetChangePassword />
    </CenterContainerLayout>
  );
};

export default ResetChangePasswordPage;
