import MainLayout from '../components/templates/MainLayout';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AdminWindow from '../components/organisms/AdminWindow';

const AdminPage = () => {
  const items = [
    [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon /> },
      { text: 'Projects', icon: <LibraryBooksOutlinedIcon /> },
      { text: 'Reports', icon: <AssessmentOutlinedIcon /> },
      { text: 'Employee', icon: <AssessmentOutlinedIcon /> },
      { text: 'Teams', icon: <BusinessOutlinedIcon /> },
    ],
  ];

  return (
    <MainLayout items={items}>
      <AdminWindow />
    </MainLayout>
  );
};

export default AdminPage;
