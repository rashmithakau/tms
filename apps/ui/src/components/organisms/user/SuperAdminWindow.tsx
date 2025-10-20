import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Alert, Typography, useTheme } from '@mui/material';
import PageLoading from '../../molecules/common/loading/PageLoading';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { UserRole } from '@tms/shared';
import TableWindowLayout from '../../templates/layout/TableWindowLayout';
import { EmployeeRow } from '../../../interfaces/component/table/ITableRowTypes';
import CreateAccountPopup from '../auth/popup/CreateAccountPopup';
import BaseBtn from '../../atoms/common/button/BaseBtn';
import EmpTable from '../table/EmpTable';
import EmpTableToolbar from '../../molecules/common/other/EmpTableToolbar';
import { select_btn } from '../../../store/slices/dashboardNavSlice';
import { useUsers, useUsersByRoles } from '../../../hooks/api/useUsers';
import AdminDashboardWindow from '../admin/AdminDashboardWindow';
import { useDashboardStats, useTimesheetRejectionReasons } from '../../../hooks/api/useDashboard';
import EditAccountPopup from '../auth/popup/EditAccountPopup';
import ProfilePopup from '../popup/ProfilePopup';
import { SuperAdminHistoryWindow } from '../history';


const SuperAdminWindow: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const selectedBtn = useSelector((state: any) => state.dashboardNav.selectedBtn);

  useEffect(() => {
    if (!selectedBtn || (selectedBtn !== 'Dashboard' && selectedBtn !== 'Accounts' && selectedBtn !== 'History')) {
      dispatch(select_btn('Dashboard'));
    }
  }, []);

  // Dashboard hooks
  const { 
    dashboardStats, 
    loading: statsLoading, 
    error: statsError 
  } = useDashboardStats();
  
  const { 
    rejectionReasons, 
    loading: rejectionLoading, 
    error: rejectionError 
  } = useTimesheetRejectionReasons();

  // Users hooks 
  const { users, isLoading: usersLoading, error: usersError, refreshUsers } = useUsersByRoles([UserRole.Admin, UserRole.SupervisorAdmin]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EmployeeRow | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<EmployeeRow | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'supervisorAdmin'>('all');

  // Transform dashboard stats for the component
  const dashboardStatsData = useMemo(() => {
    if (!dashboardStats) {
      return {
        userStats: {
          totalUsers: 0,
          activeUsers: 0,
          newUsersThisMonth: 0,
          totalAdmins: 0
        },
        projectStats: {
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0
        },
        timesheetStats: {
          pendingApprovals: 0,
          approvedThisWeek: 0,
          totalHoursLogged: 0
        },
        teamStats: {
          totalTeams: 0
        }
      };
    }
    
    return {
      userStats: {
        totalUsers: dashboardStats.userStats?.totalUsers || 0,
        activeUsers: dashboardStats.userStats?.activeUsers || 0,
        newUsersThisMonth: 0, 
        totalAdmins: dashboardStats.userStats?.totalAdmins || 0
      },
      projectStats: {
        totalProjects: dashboardStats.projectStats?.totalProjects || 0,
        activeProjects: dashboardStats.projectStats?.activeProjects || 0,
        completedProjects: 0 
      },
      timesheetStats: {
        pendingApprovals: dashboardStats.timesheetStats?.pendingCount || 0,
        approvedThisWeek: dashboardStats.timesheetStats?.approvedCount || 0,
        totalHoursLogged: 0 
      },
      teamStats: {
        totalTeams: dashboardStats.teamStats?.totalTeams || 0
      }
    };
  }, [dashboardStats]);

  // Helper function to convert role enum to display text
  const getRoleDisplayText = (role: UserRole): string => {
    switch (role) {
      case UserRole.Admin:
        return 'Admin';
      case UserRole.SupervisorAdmin:
        return 'Supervisor Admin';
      case UserRole.SuperAdmin:
        return 'Super Admin';
      case UserRole.Supervisor:
        return 'Supervisor';
      case UserRole.Emp:
        return 'Employee';
      default:
        return 'Unknown';
    }
  };

  const rows: EmployeeRow[] = useMemo(() => {
    return users.map((user) => ({
      id: (user as any)._id,
      employee_id: (user as any).employee_id || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      designation: (user as any).designation || '',
      team: undefined,
      role: getRoleDisplayText(user.role),
      status:
        typeof user.status === 'boolean'
          ? user.status
            ? 'Active'
            : 'Inactive'
          : user.status === 'Active' || user.status === 'Inactive'
          ? user.status
          : 'Active',
      contactNumber: user.contactNumber || '',
      createdAt: user.createdAt || '',
    }));
  }, [users]);

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);
  const handleAccountCreated = () => refreshUsers();
  
  const handleRoleFilterChange = (val: string) => {
    if (val === 'all' || val === 'admin' || val === 'supervisorAdmin') {
      setRoleFilter(val as 'all' | 'admin' | 'supervisorAdmin');
    }
  };


  if (selectedBtn === 'Dashboard') {
    return (
      <>
        <AdminDashboardWindow
          statsData={dashboardStatsData}
          statsLoading={statsLoading}
          statsError={statsError}
          rejectionReasons={rejectionReasons}
          rejectionReasonsLoading={rejectionLoading}
          rejectionReasonsError={rejectionError}
          timesheetStats={dashboardStats?.timesheetStats}
          onAddUser={handleOpenPopup}
          onAddProject={undefined}
          onEditUser={undefined}
          onDeleteUser={undefined}
          onEditProject={undefined}
          onDeleteProject={undefined}
          onViewReports={undefined}
          onViewTimesheet={undefined}
        />
        
        <CreateAccountPopup
          open={isPopupOpen}
          onClose={handleClosePopup}
          role={UserRole.Admin}
          onSuccess={handleAccountCreated}
        />
        <EditAccountPopup
          open={isEditOpen}
          onClose={() => { setIsEditOpen(false); setEditingUser(null); }}
          user={editingUser}
          onSuccess={async () => { await refreshUsers(); }}
        />
        </>
    );
  }

  // Accounts View
  if (selectedBtn === 'Accounts') {
    return (
      <>
        {usersError && (
          <Box sx={{ m: 2 }}>
            <Alert severity="error" onClose={() => {}}>
              {usersError}
            </Alert>
          </Box>
        )}

        {usersLoading ? (
          <PageLoading variant="inline" message="Loading admin accounts..." />
        ) : (
          <TableWindowLayout
            title="Admin Accounts"
            buttons={[
              <Box sx={{ mt: 2 }}>
                <EmpTableToolbar
                  projectsOptions={[]}
                  selectedProjectIds={[]}
                  onSelectedProjectIdsChange={() => {}}
                  statusFilter="all"
                  onStatusFilterChange={() => {}}
                  roleFilter={roleFilter}
                  onRoleFilterChange={handleRoleFilterChange}
                  availableRoles={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'supervisorAdmin', label: 'Supervisor Admin' }
                  ]}
                />
              </Box>,
              <Box sx={{ mt: 2 }}>
                <BaseBtn onClick={handleOpenPopup} variant="contained" startIcon={<AddOutlinedIcon />}>
                  Admin
                </BaseBtn>
              </Box>,
            ]}
            filter={null}
            table={<EmpTable 
              rows={rows} 
              onRefresh={refreshUsers} 
              roleFilter={roleFilter}
              onEditRow={(row) => { setProfileUser(row); setIsProfileOpen(true); }}
            />}
          />
        )}

        <CreateAccountPopup
          open={isPopupOpen}
          onClose={handleClosePopup}
          role={UserRole.Admin}
          onSuccess={handleAccountCreated}
        />
        <EditAccountPopup
          open={isEditOpen}
          onClose={() => { setIsEditOpen(false); setEditingUser(null); }}
          user={editingUser}
          onSuccess={async () => { await refreshUsers(); }}
        />
        <ProfilePopup
          open={isProfileOpen}
          onClose={() => { setIsProfileOpen(false); setProfileUser(null); }}
          user={profileUser}
        />
</>
    );
  }

  // History View
  if (selectedBtn === 'History') {
    return <SuperAdminHistoryWindow />;
  }

  return null;

};

export default SuperAdminWindow;


