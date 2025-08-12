import MainLayout from '../components/templates/MainLayout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { useSelector } from 'react-redux'
import CreateProject from '../components/organisms/CreateProject';
import CreateEmployee from '../components/organisms/CreateEmployee';


const AdminPage = () => {
  const selectedBtn=useSelector((state:any)=>state.dashboardNav.selectedBtn)
  const items = [
    [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon /> },
      { text: 'Accounts', icon: <PersonOutlineIcon /> },
      { text: 'Projects', icon: <LibraryBooksOutlinedIcon /> },
      { text: 'Reports', icon: <AssessmentOutlinedIcon /> },
      { text: 'Employee', icon: <AssessmentOutlinedIcon /> },
    ],
  ];
  return(
  <MainLayout items={items} >
    {selectedBtn=="Projects" && <CreateProject/>}
    {selectedBtn=="Employee" && <CreateEmployee/>}
    </MainLayout>
  );
};

export default AdminPage;
