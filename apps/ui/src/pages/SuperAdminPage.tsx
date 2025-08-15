import MainLayout from '../components/templates/MainLayout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CreateAccountPopup from '../components/organisms/CreateAccountPopup';
import { useEffect, useState } from 'react';
import BaseBtn from '../components/atoms/buttons/BaseBtn';
import { Box } from '@mui/material';
import { UserRole } from '@tms/shared';
import { useSelector } from 'react-redux';
import TableWindowLayout, {
  EmpRow,
} from '../components/templates/TableWindowLayout'; // Assuming TimeSheetPage is in the same directory
import { getUsers } from '../api/user';

const SuperAdminPage = () => {
  const [users, setUsers] = useState<EmpRow[]>([]); // Ensure the state is typed correctly

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers(UserRole.Admin);
        if (response && response.data.users) {
          setUsers(response.data.users);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  console.log(users);

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
        <div>
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
          />
          <CreateAccountPopup
            open={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            role={UserRole.Admin}
          />
        </div>
      )}
    </MainLayout>
  );
};

export default SuperAdminPage;
