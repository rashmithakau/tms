import MainLayout from '../components/templates/MainLayout';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { useSelector } from 'react-redux';
import CreateProjectPopUp from '../components/organisms/CreateProjectPopUp';
import BaseBtn from '../components/atoms/buttons/BaseBtn';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useState } from 'react';
import CreateAccountPopup from '../components/organisms/CreateAccountPopup';
import { UserRole } from '@tms/shared';
import TableWindowLayout, {
  EmpRow,
} from '../components/templates/TableWindowLayout';
import { useUsers } from '../hooks/useUsers';

const AdminPage = () => {
  const { users, isLoading, error, refreshUsers } = useUsers(UserRole.Emp);

  const [isProjectPopupOpen, setIsProjectPopupOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const selectedBtn = useSelector(
    (state: any) => state.dashboardNav.selectedBtn
  );

  const rows: EmpRow[] = [];
  console.log(users);

  users.forEach((user) => {
    rows.push({
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      designation: user.designation || '',
      status: user.status || '',
      contactNumber: user.contactNumber || '',
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
      { text: 'Projects', icon: <LibraryBooksOutlinedIcon /> },
      { text: 'Reports', icon: <AssessmentOutlinedIcon /> },
      { text: 'Employee', icon: <AssessmentOutlinedIcon /> },
    ],
  ];
  
  return (
    <MainLayout items={items}>
      {selectedBtn === 'Employee' && (
        <div>
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
              title="Employee Account"
              buttons={[
                <Box sx={{ mt: 2, ml: 2 }}>
                  <BaseBtn onClick={handleOpenPopup} variant="contained">
                    Create Employee
                  </BaseBtn>
                </Box>,
              ]}
            />
          )}
          
          <CreateAccountPopup
            open={isPopupOpen}
            onClose={handleClosePopup}
            role={UserRole.Emp}
            onSuccess={handleAccountCreated}
          />
        </div>
      )}

      {selectedBtn === 'Projects' && (
        <div>
          <Box sx={{ mt: 2, ml: 2 }}>
            <BaseBtn
              onClick={() => setIsProjectPopupOpen(true)}
              variant="contained"
            >
              Create Project
            </BaseBtn>
          </Box>
          <CreateProjectPopUp
            open={isProjectPopupOpen}
            onClose={() => setIsProjectPopupOpen(false)}
          />
        </div>
      )}
    </MainLayout>
  );
};

export default AdminPage;
