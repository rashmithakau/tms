import MainLayout from '../components/templates/MainLayout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CreateAccountPopup from '../components/organisms/CreateAccountPopup';
import { useState } from 'react';
import BaseBtn from '../components/atoms/buttons/BaseBtn';
import { Box } from '@mui/material';
import { UserRole } from '@tms/shared';

const SuperAdminPage = () => {
      const items = [
    [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon /> },
      { text: 'Accounts', icon: <PersonOutlineIcon /> },
      { text: 'Projects', icon: <LibraryBooksOutlinedIcon /> },
      {text: 'Reports', icon: <AssessmentOutlinedIcon /> }

    ]
  ];
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  return (
    <MainLayout items={items}>
      <Box sx={{}}>
      <BaseBtn onClick={handleOpenPopup} variant='contained'>Add Admin</BaseBtn>
      </Box>
           
      <CreateAccountPopup open={isPopupOpen} onClose={()=>{}} role={UserRole.Emp}/>
    </MainLayout>
  );
};

export default SuperAdminPage;