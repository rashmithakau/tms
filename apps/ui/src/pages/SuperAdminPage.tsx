import MainLayout from '../components/templates/layout/MainLayout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import HistoryIcon from '@mui/icons-material/History';
import SuperAdminWindow from '../components/organisms/user/SuperAdminWindow';
const SuperAdminPage = () => {
  const items = [
    [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon /> },
      { text: 'Accounts', icon: <PersonOutlineIcon /> },
      { text: 'History', icon: <HistoryIcon /> }
    ],
  ];

  return (
    <MainLayout items={items}>
      <SuperAdminWindow />
    </MainLayout>
  );
};

export default SuperAdminPage;
