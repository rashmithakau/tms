import MainLayout from '../components/templates/layout/MainLayout';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AdminWindow from '../components/organisms/user/AdminWindow';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@tms/shared';


const AdminPage = () => {

    const items = [
    [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon /> },
      { text: 'Projects', icon: <LibraryBooksOutlinedIcon /> },
      { text: 'Reports', icon: <AssessmentOutlinedIcon /> },
      { text: 'Accounts', icon: <AssessmentOutlinedIcon /> },
      { text: 'Teams', icon: <BusinessOutlinedIcon /> },
      { text: 'My Timesheets', icon: <AssignmentIcon /> },
    ]
  ];

    const { authState } = useAuth();
    const {  user } = authState;

    if(user?.role==UserRole.SupervisorAdmin){
      items[0].push({ text: 'Review Timesheets', icon: <RateReviewIcon /> });
    }

  return (
    <MainLayout items={items}>
      <AdminWindow />
    </MainLayout>
  );
};

export default AdminPage;
