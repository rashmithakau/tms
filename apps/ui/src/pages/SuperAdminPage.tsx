import MainLayout from '../components/templates/MainLayout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import SuperAdminWindow from '../components/organisms/SuperAdminWindow';
const SuperAdminPage = () => {
  const items = [
    [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon /> },
      { text: 'Accounts', icon: <PersonOutlineIcon /> }
    ],
  ];

  return (
    <MainLayout items={items}>
      <SuperAdminWindow />
    </MainLayout>
  );
};

export default SuperAdminPage;
