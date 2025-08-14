import MainLayout from '../components/templates/MainLayout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { useSelector } from 'react-redux';
import CreateProjectPopUp from '../components/organisms/CreateProjectPopUp';
import BaseBtn from '../components/atoms/buttons/BaseBtn';
import { Box } from '@mui/material';
import { useState } from 'react';
import CreateAccountPopup from '../components/organisms/CreateAccountPopup';
import { UserRole } from '@tms/shared';
const AdminPage = () => {
  const selectedBtn = useSelector(
    (state: any) => state.dashboardNav.selectedBtn
  );
  const items = [
    [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon /> },
      { text: 'Accounts', icon: <PersonOutlineIcon /> },
      { text: 'Projects', icon: <LibraryBooksOutlinedIcon /> },
      { text: 'Reports', icon: <AssessmentOutlinedIcon /> },
      { text: 'Employee', icon: <AssessmentOutlinedIcon /> },
    ],
  ];
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProjectPopupOpen, setIsProjectPopupOpen] = useState(false);
  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };
  return (
    <MainLayout items={items}>
      <Box sx={{ mt: 2, ml: 2 }}>
        <BaseBtn onClick={handleOpenPopup} variant="contained">
          Create Employee
        </BaseBtn>
      </Box>
      <Box sx={{ mt: 2, ml: 2 }}>
        <BaseBtn
          onClick={() => setIsProjectPopupOpen(true)}
          variant="contained"
        >
          Create Project
        </BaseBtn>
      </Box>
      <CreateAccountPopup
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        role={UserRole.Emp}
      />
      <CreateProjectPopUp
        open={isProjectPopupOpen}
        onClose={() => setIsProjectPopupOpen(false)}
      />
      {selectedBtn == 'Projects' && <div />}
      {/* {selectedBtn=="Employee" && <CreateEmployee/>} */}
    </MainLayout>
  );
};

export default AdminPage;
