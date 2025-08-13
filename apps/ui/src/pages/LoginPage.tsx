import LoginLeftPanel from '../components/organisms/LoginLeftPanel';
import TwoColumnLayout from '../components/templates/TwoColumnLayout';
import LoginBackgroundImage from '../assets/images/LoginBackgroundImage.jpg';

import WebSiteLogo from '../assets/images/WebSiteLogo.png'

import LoginFormSection from '../components/organisms/LoginFormSection';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import LoadingWindow from '../components/molecules/LoadingWindow';

const LoginPage: React.FC = () => {
  const login = useSelector((state: RootState) => state.user);
  return (
    
    <div>{login.loading?
      <LoadingWindow/>
    :
     <TwoColumnLayout 
       leftContent={
          <LoginLeftPanel
            icon={WebSiteLogo}
            imageSrc={LoginBackgroundImage}
            title="Welcome to TimeSync "
            description="Log your hours, monitor your tasks, and manage your day — all in one place."
          />
        }
        rightContent={
          <LoginFormSection />
        }
      />
  }</div>
  );
};

export default LoginPage;
