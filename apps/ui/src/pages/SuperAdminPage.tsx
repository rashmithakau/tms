import MainLayout from '../components/templates/MainLayout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CreateAccountPopup from '../components/organisms/CreateAccountPopup';
import { useState } from 'react';
import BaseBtn from '../components/atoms/buttons/BaseBtn';
import { Box, Alert, CircularProgress } from '@mui/material';
import { UserRole } from '@tms/shared';
import { useSelector } from 'react-redux';
import TableWindowLayout, {
  EmpRow,
} from '../components/templates/TableWindowLayout'; // Assuming TimeSheetPage is in the same directory
import { useUsers } from '../hooks/useUsers';
import EmpTable from '../components/organisms/EmpTable';

const SuperAdminPage = () => {
  const { users, isLoading, error, refreshUsers } = useUsers(UserRole.Admin);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const selectedBtn = useSelector(
    (state: any) => state.dashboardNav.selectedBtn
  );

  const rows: EmpRow[] = [];

  users.forEach((user) => {
    rows.push({
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      designation: user.designation || '',
      status: user.status || '',
      contactNumber: user.contactNumber || '',
      createdAt: user.createdAt || '',
    });
  });

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleAccountCreated = () => {
    // Refresh the table data after account creation
    refreshUsers();
  };

  const items = [
    [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon /> },
      { text: 'Accounts', icon: <PersonOutlineIcon /> },
      { text: 'Projects', icon: <LibraryBooksOutlinedIcon /> },
      { text: 'Reports', icon: <AssessmentOutlinedIcon /> },
    ],
  ];

  return (
    <MainLayout items={items}>
      {selectedBtn === 'Accounts' && (
        <Box>
          {error && (
            <Box sx={{ m: 2 }}>
              <Alert severity="error" onClose={() => {}}>
                {error}
              </Alert>
            </Box>
          )}
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableWindowLayout
              rows={rows}
              title="Admin Account"
              buttons={[
                <Box sx={{ mt: 2, ml: 2 }}>
                  <BaseBtn onClick={handleOpenPopup} variant="contained">
                    Create Admin
                  </BaseBtn>
                </Box>,
              ]}
              table={<EmpTable rows={rows} />}
            />
          )}
          
          <CreateAccountPopup
            open={isPopupOpen}
            onClose={handleClosePopup}
            role={UserRole.Admin}
            onSuccess={handleAccountCreated}
          />
        </Box>
      )}
    </MainLayout>
  );
};

export default SuperAdminPage;
