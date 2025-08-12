import MainLayout from '../components/templates/MainLayout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CreateProject from '../components/organisms/CreateProject';




const AdminPage = () => {
  const items = [
    [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon /> },
      { text: 'Accounts', icon: <PersonOutlineIcon /> },
      { text: 'Projects', icon: <LibraryBooksOutlinedIcon /> },
      { text: 'Reports', icon: <AssessmentOutlinedIcon /> },
    ],
  ];
  return (
    <MainLayout items={items} >
      <CreateProject/>
    
    </MainLayout>
  );
};

export default AdminPage;
