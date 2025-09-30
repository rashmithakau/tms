import LoginLeftPanel from '../components/organisms/auth/login/LoginLeftPanel';
import TwoColumnLayout from '../components/templates/layout/TwoColumnLayout';
import LoginBackgroundImage from '../assets/images/LoginBackgroundImage.jpg';

import WebSiteLogo from '../assets/images/WebSiteLogo.png';

import LoginFormSection from '../components/organisms/auth/login/LoginFormSection';

const LoginPage: React.FC = () => {
  return (
    <TwoColumnLayout
      leftContent={
        <LoginLeftPanel
          icon={WebSiteLogo}
          imageSrc={LoginBackgroundImage}
          title="Welcome to TimeSync "
          description="Log your hours, monitor your tasks, and manage your day — all in one place."
        />
      }
      rightContent={<LoginFormSection />}
    />
  );
};

export default LoginPage;
