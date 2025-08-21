import MainLayout from '../components/templates/MainLayout';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { useDispatch, useSelector } from 'react-redux';
import CreateProjectPopUp from '../components/organisms/CreateProjectPopUp';
import BaseBtn from '../components/atoms/buttons/BaseBtn';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import CreateAccountPopup from '../components/organisms/CreateAccountPopup';
import { UserRole } from '@tms/shared';
import TableWindowLayout, {
  EmpRow, ProjectRow,
} from '../components/templates/TableWindowLayout';
import { useUsers } from '../hooks/useUsers';
import { listProjects, ProjectListItem } from '../api/project';
import { select_btn } from '../store/slices/dashboardNavSlice';
import EmpTable from '../components/organisms/EmpTable';
import ProjectTable from '../components/organisms/ProjectTable';

const AdminPage = () => {
  const { users, isLoading, error, refreshUsers } = useUsers(UserRole.Emp);

  const [isProjectPopupOpen, setIsProjectPopupOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const dispatch = useDispatch();

  const selectedBtn = useSelector(
    (state: any) => state.dashboardNav.selectedBtn
  );

  useEffect(() => {
    // Ensure the correct tab is selected when visiting Admin page
    if (selectedBtn !== 'Employee') {
      dispatch(select_btn('Employee'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const resp = await listProjects();
        const data = resp.data?.projects as ProjectListItem[];
        setProjects(Array.isArray(data) ? data : []);
      } catch (e) {
        // ignore for now, keep empty
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);

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
  // Project rows
  const projectRows: ProjectRow[] = projects.map(p => ({
    id: p._id,
    projectName: p.projectName,
    billable: p.billable ? 'Yes' : 'No',
    createdAt: p.createdAt,
    employees: (p.employees || []).map(e => ({ id: e._id, name: `${e.firstName} ${e.lastName}`.trim(), designation: e.designation })),
    supervisor: p.supervisor ? { id: p.supervisor._id, name: `${p.supervisor.firstName} ${p.supervisor.lastName}`.trim(), designation: p.supervisor.designation } : null,
  }));

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
              title="Employee Account"
              buttons={[
                <Box sx={{ mt: 2, ml: 2 }}>
                  <BaseBtn onClick={handleOpenPopup} variant="contained">
                    Create Employee
                  </BaseBtn>
                </Box>,
              ]}
              table={<EmpTable rows={rows} />}
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
              title="Projects"
              buttons={[
                <Box sx={{ mt: 2, ml: 2 }}>
                  <BaseBtn
                    onClick={() => setIsProjectPopupOpen(true)}
                    variant="contained"
                  >
                    Create Project
                  </BaseBtn>
                </Box>,
              ]}
              table={<ProjectTable rows={projectRows} onRefresh={async () => {
                try {
                  const resp = await listProjects();
                  const data = resp.data?.projects as ProjectListItem[];
                  setProjects(Array.isArray(data) ? data : []);
                } catch {}
              }} />}
            />
          )}

          <CreateProjectPopUp
            open={isProjectPopupOpen}
            onClose={async () => {
              setIsProjectPopupOpen(false);
              try {
                const resp = await listProjects();
                const data = resp.data?.projects as ProjectListItem[];
                setProjects(Array.isArray(data) ? data : []);
              } catch {}
            }}
          />
        </div>
      )}
    </MainLayout>
  );
};

export default AdminPage;
