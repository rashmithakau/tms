import MainLayout from '../components/templates/MainLayout';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AdminWindow from '../components/organisms/AdminWindow';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { useEffect } from 'react';
import { useAuth } from '../components/contexts/AuthContext';
import { UserRole } from '@tms/shared';





const AdminPage = () => {

    const items = [
    [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon /> },
      { text: 'Projects', icon: <LibraryBooksOutlinedIcon /> },
      { text: 'Reports', icon: <AssessmentOutlinedIcon /> },
      { text: 'Employee', icon: <AssessmentOutlinedIcon /> },
      { text: 'Teams', icon: <BusinessOutlinedIcon /> },
      { text: 'My Timesheets', icon: <AssignmentIcon /> },
    ]
  ];

  useEffect(() => {
    if(user?.role==UserRole.SupervisorAdmin){
      items[0].push({ text: 'Review Timesheets', icon: <RateReviewIcon /> });
    }
  }
, []);

    const { authState } = useAuth();
  const {  user } = authState;


  return (
    <MainLayout items={items}>
      <AdminWindow />
    </MainLayout>
  );
};

export default AdminPage;
