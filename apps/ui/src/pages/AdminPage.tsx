import MainLayout from '../components/templates/MainLayout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { useSelector } from 'react-redux';
import CreateProjectPopUp from '../components/organisms/CreateProjectPopUp';
import BaseBtn from '../components/atoms/buttons/BaseBtn';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import CreateAccountPopup from '../components/organisms/CreateAccountPopup';
import { UserRole } from '@tms/shared';
import TableWindowLayout, {
  EmpRow,
} from '../components/templates/TableWindowLayout';
import { getUsers } from '../api/user';
const AdminPage = () => {
  const [users, setUsers] = useState<EmpRow[]>([]); // Ensure the state is typed correctly

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers(UserRole.Emp);
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

  const items = [
    [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon /> },
      { text: 'Accounts', icon: <PersonOutlineIcon /> },
      { text: 'Projects', icon: <LibraryBooksOutlinedIcon /> },
      { text: 'Reports', icon: <AssessmentOutlinedIcon /> },
      { text: 'Employee', icon: <AssessmentOutlinedIcon /> },
    ],
  ];
  return (
    <MainLayout items={items}>
      {selectedBtn === 'Accounts' && (
        <div>
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
          <CreateAccountPopup
            open={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            role={UserRole.Emp}
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
