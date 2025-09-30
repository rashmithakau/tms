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
import { select_btn } from '../../../store/slices/dashboardNavSlice';
import { useUsers } from '../../../hooks/api/useUsers';
import AdminDashboardWindow from '../admin/AdminDashboardWindow';
import { useDashboardStats, useTimesheetRejectionReasons } from '../../../hooks/api/useDashboard';

const SuperAdminWindow: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const selectedBtn = useSelector((state: any) => state.dashboardNav.selectedBtn);

  useEffect(() => {
    if (!selectedBtn || (selectedBtn !== 'Dashboard' && selectedBtn !== 'Accounts')) {
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
  const { users, isLoading: usersLoading, error: usersError, refreshUsers } = useUsers(UserRole.Admin);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

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
        newUsersThisMonth: 0, // This field might not exist in API
        totalAdmins: dashboardStats.userStats?.totalAdmins || 0
      },
      projectStats: {
        totalProjects: dashboardStats.projectStats?.totalProjects || 0,
        activeProjects: dashboardStats.projectStats?.activeProjects || 0,
        completedProjects: 0 // This field might not exist in API
      },
      timesheetStats: {
        pendingApprovals: dashboardStats.timesheetStats?.pendingCount || 0,
        approvedThisWeek: dashboardStats.timesheetStats?.approvedCount || 0,
        totalHoursLogged: 0 // This field might not exist in API
      },
      teamStats: {
        totalTeams: dashboardStats.teamStats?.totalTeams || 0
      }
    };
  }, [dashboardStats]);

  const rows: EmployeeRow[] = useMemo(() => {
    return users.map((user) => ({
      id: (user as any)._id,
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      team: undefined,
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


  if (selectedBtn === 'Dashboard') {
    return (
      <Box>
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
      </Box>
    );
  }

  // Accounts View
  if (selectedBtn === 'Accounts') {
    return (
      <Box>
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
              <Box sx={{ mt: 2, ml: 2 }}>
                <BaseBtn onClick={handleOpenPopup} variant="contained" startIcon={<AddOutlinedIcon />}>
                  Admin
                </BaseBtn>
              </Box>,
            ]}
            table={<EmpTable rows={rows} onRefresh={refreshUsers} />}
          />
        )}

        <CreateAccountPopup
          open={isPopupOpen}
          onClose={handleClosePopup}
          role={UserRole.Admin}
          onSuccess={handleAccountCreated}
        />
      </Box>
    );
  }

  return null;

};

export default SuperAdminWindow;


