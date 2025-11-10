import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { UserRole } from '@tms/shared';
import { useAllUsersIncludingInactive } from '../../../hooks/api/useUsers';
import { listProjects } from '../../../api/project';
import { ProjectListItem } from '../../../interfaces';
import { select_btn } from '../../../store/slices/dashboardNavSlice';
import EmployeeSection from '../../molecules/employee/EmployeeSection';
import ProfilePopup from '../popup/ProfilePopup';
import ProjectsSection from '../../molecules/project/ProjectsSection';
import TeamsSection from '../../molecules/team/TeamsSection';
import CreateAccountPopup from '../auth/popup/CreateAccountPopup';
import EditAccountPopup from '../auth/popup/EditAccountPopup';
import CreateProjectPopUp from '../popup/CreateProjectPopUp';
import CreateTeamPopUp from '../popup/CreateTeamPopUp';
import { EmployeeRow, ProjectRow, TeamRow } from '../../../interfaces/component/table/ITableRowTypes';
import { listTeams } from '../../../api/team';
import { TeamListItem } from '../../../interfaces';
import MyTimesheetsWindow from '../timesheet/MyTimesheetsWindow';
import ReviewTimesheetsWindow from '../timesheet/ReviewTimesheetsWindow';
import ReportDashboard from '../report/ReportDashboard';
import { AdminDashboardWindow } from '../admin';
import { 
  IAdminStatsOverviewProps, 
  ITableColumn 
} from '../../../interfaces/dashboard';
import { useDashboardStats, useTimesheetRejectionReasons } from '../../../hooks/api/useDashboard';
import { AdminHistoryWindow } from '../history';


const AdminWindow: React.FC = () => {
  const roles = useMemo(() => [UserRole.Emp, UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin] as const, []);
  const { users, isLoading, error, refreshUsers } =
    useAllUsersIncludingInactive(roles as unknown as UserRole[]);

  const [isTeamPopupOpen, setIsTeamPopupOpen] = useState(false);
  const [teamsKey, setTeamsKey] = useState(0);
  const [isProjectPopupOpen, setIsProjectPopupOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EmployeeRow | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<EmployeeRow | null>(null);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'Active' | 'Inactive'
  >('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'supervisorAdmin' | 'supervisor' | 'emp'>('all');
  const [billable, setBillable] = useState<'all' | 'Yes' | 'No'>('all');
  
  const dispatch = useDispatch();
  const selectedBtn = useSelector(
    (state: any) => state.dashboardNav.selectedBtn
  );

  const { dashboardStats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { rejectionReasons, loading: rejectionLoading, error: rejectionError } = useTimesheetRejectionReasons(5);

  const dashboardStatsData: IAdminStatsOverviewProps = useMemo(() => {
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
        totalUsers: dashboardStats.userStats.totalUsers,
        activeUsers: dashboardStats.userStats.activeUsers,
        newUsersThisMonth: Math.floor(dashboardStats.userStats.totalUsers * 0.05), 
        totalAdmins: dashboardStats.userStats.totalAdmins
      },
      projectStats: {
        totalProjects: dashboardStats.projectStats.totalProjects,
        activeProjects: dashboardStats.projectStats.activeProjects,
        completedProjects: dashboardStats.projectStats.totalProjects - dashboardStats.projectStats.activeProjects
      },
      timesheetStats: {
        pendingApprovals: dashboardStats.timesheetStats.pendingCount,
        approvedThisWeek: dashboardStats.timesheetStats.approvedCount,
        totalHoursLogged: dashboardStats.timesheetStats.submittedCount * 40 
      },
      teamStats: {
        totalTeams: dashboardStats.teamStats.totalTeams
      }
    };
  }, [dashboardStats]);

  // Dashboard table data
  const dashboardUserColumns: ITableColumn[] = [
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'createdAt', headerName: 'Created', width: 150 }
  ];

  const dashboardProjectColumns: ITableColumn[] = [
    { field: 'projectName', headerName: 'Project Name', width: 200 },
    { field: 'clientName', headerName: 'Client Name', width: 200 },
    { field: 'billable', headerName: 'Billable', width: 100 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: ({ value }) => value ? 'Active' : 'Inactive'
    },
    { field: 'createdAt', headerName: 'Created', width: 150 }
  ];

  useEffect(() => {
    
    if (selectedBtn !== 'Dashboard') {
      dispatch(select_btn('Dashboard'));
    }
    
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const resp = await listProjects();
        const data = resp.data?.projects as ProjectListItem[];
        setProjects(Array.isArray(data) ? data : []);
      } catch (e) {
        
        setProjects([]);
      }
    };
    const fetchTeams = async () => {
      try {
        const resp = await listTeams();
        const data = resp.data?.teams as TeamListItem[];
        setTeams(Array.isArray(data) ? data : []);
      } catch (e) {
        setTeams([]);
      }
    };
    fetchProjects();
    fetchTeams();
  }, []);

  const projectOptions = useMemo(
    () => projects.map((p) => ({ id: p._id, name: p.projectName })),
    [projects]
  );

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
    const mappedRows = users.map((user) => {
      const uid = (user as any)._id as string;
      return {
        id: uid,
        employee_id: (user as any).employee_id || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        designation: user.designation || '',
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
        role: getRoleDisplayText(user.role),
        createdAt: user.createdAt || '',
      } as EmployeeRow;
    });

    return mappedRows;
  }, [users]);

  const filteredRows: EmployeeRow[] = useMemo(() => {
    let res = rows;

    if (statusFilter !== 'all') {
      res = res.filter((r) => r.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      res = res.filter((r) => {
        
        const rowRole = r.role;
        if (typeof rowRole === 'string') {
        
          const roleMap: Record<string, string> = {
            'Admin': 'admin',
            'Supervisor Admin': 'supervisorAdmin', 
            'Super Admin': 'superAdmin',
            'Supervisor': 'supervisor',
            'Employee': 'emp'
          };
          const actualRole = roleMap[rowRole] || rowRole;
          return actualRole === roleFilter;
        }
        return rowRole === roleFilter;
      });
    }
    return res;
  }, [rows, statusFilter, roleFilter]);


  const projectRows: ProjectRow[] = useMemo(
    () =>
      projects.map((p) => ({
        id: p._id,
        projectName: p.projectName,
        billable: p.billable ? 'Yes' : 'No',
        clientName: p.clientName,
        createdAt: p.createdAt,
        employees: (p.employees || []).map((e) => ({
          id: e._id,
          name: `${e.firstName} ${e.lastName}`.trim(),
          designation: e.designation || undefined,
          email: e.email || undefined,
        })),
        supervisor: p.supervisor
          ? {
              id: p.supervisor._id,
              name: `${p.supervisor.firstName} ${p.supervisor.lastName}`.trim(),
              designation: p.supervisor.designation || undefined,
              email: p.supervisor.email || undefined,
            }
          : null,
      })),
    [projects]
  );

  const teamRows: TeamRow[] = useMemo(
    () =>
      teams.map((t) => ({
        id: t._id,
        teamName: t.teamName,
        createdAt: t.createdAt,
        members: (t.members || []).map((m) => ({
          id: m._id,
          name: `${m.firstName} ${m.lastName}`.trim(),
          designation: (m as any).designation,
          email: (m as any).email,
        })),
        supervisor: t.supervisor
          ? {
              id: t.supervisor._id,
              name: `${t.supervisor.firstName} ${t.supervisor.lastName}`.trim(),
              designation: (t.supervisor as any).designation,
              email: (t.supervisor as any).email,
            }
          : null,
      })),
    [teams]
  );

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleAccountCreated = () => {
    
    refreshUsers();
  };

  const handleCloseTeamPopup = async () => {
    setIsTeamPopupOpen(false);
    setTeamsKey((k) => k + 1);
    
    try {
      const resp = await listTeams();
      const data = resp.data?.teams as TeamListItem[];
      setTeams(Array.isArray(data) ? data : []);
    } catch (e) {
      setTeams([]);
    }
  };

  const handleProjectRefresh = async () => {
    try {
      const resp = await listProjects();
      const data = resp.data?.projects as ProjectListItem[];
      setProjects(Array.isArray(data) ? data : []);
     
      await refreshUsers();
    } catch {}
  };

  const handleProjectClose = async () => {
    setIsProjectPopupOpen(false);
    try {
      const resp = await listProjects();
      const data = resp.data?.projects as ProjectListItem[];
      setProjects(Array.isArray(data) ? data : []);
      
      await refreshUsers();
    } catch {}
  };

  return (
    <>
      {selectedBtn === 'Dashboard' && (
        <Box sx={{height:"100%"}}>
          <AdminDashboardWindow
            statsData={dashboardStatsData}
            statsLoading={statsLoading}
            statsError={statsError}
            rejectionReasons={rejectionReasons}
            rejectionReasonsLoading={rejectionLoading}
            rejectionReasonsError={rejectionError}
            timesheetStats={dashboardStats?.timesheetStats}
            onAddUser={handleOpenPopup}
            onAddProject={() => setIsProjectPopupOpen(true)}
            onEditUser={(id) => {
              const row = rows.find((r) => r.id === id);
              setEditingUser(row ?? null);
              setIsEditOpen(true);
            }}
            onDeleteUser={(id) => console.log('Delete user:', id)}
            onEditProject={(id) => console.log('Edit project:', id)}
            onDeleteProject={(id) => console.log('Delete project:', id)}
            onViewReports={() => dispatch(select_btn('Reports'))}
            onViewTimesheet={(timesheetId) => {
              dispatch(select_btn('Review Timesheets'));
            }}
            addUserButtonLabel="Employee"
          />
          
          <CreateAccountPopup
            open={isPopupOpen}
            onClose={handleClosePopup}
            role={UserRole.Emp}
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
          <CreateProjectPopUp
            open={isProjectPopupOpen}
            onClose={handleProjectClose}
          />
        </Box>
      )}

      {selectedBtn === 'Accounts' && (
        <Box sx={{height:"100%"}}>
          <EmployeeSection
            error={error || undefined}
            isLoading={isLoading}
            rows={filteredRows}
            projectOptions={projectOptions}
            selectedProjectIds={selectedProjectIds}
            onSelectedProjectIdsChange={setSelectedProjectIds}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            onAddEmployee={handleOpenPopup}
            onEditEmployee={(row) => { setProfileUser(row); setIsProfileOpen(true); }}
            onRefresh={refreshUsers}
          />
          
          <CreateAccountPopup
            open={isPopupOpen}
            onClose={handleClosePopup}
            role={UserRole.Emp}
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
        </Box>
      )}

      {selectedBtn === 'Projects' && (
        <Box sx={{height:"100%"}}>
          <ProjectsSection
            error={error || undefined}
            isLoading={isLoading}
            rows={projectRows}
            billable={billable}
            onBillableChange={setBillable}
            onAddProject={() => setIsProjectPopupOpen(true)}
            onRefresh={handleProjectRefresh}
          />
          <CreateProjectPopUp
            open={isProjectPopupOpen}
            onClose={handleProjectClose}
          />
        </Box>
      )}

      {selectedBtn === 'Teams' && (
        <Box sx={{height:"100%"}}>
          <TeamsSection
            error={error || undefined}
            isLoading={isLoading}
            onAddTeam={() => setIsTeamPopupOpen(true)}
            key={teamsKey}
            rows={teamRows}
          />
          <CreateTeamPopUp
            open={isTeamPopupOpen}
            onClose={handleCloseTeamPopup}
          />
        </Box>
      )}

      {selectedBtn === 'My Timesheets' && (
          <MyTimesheetsWindow />
      )}

      {selectedBtn === 'Review Timesheets' && (
          <ReviewTimesheetsWindow />
      )}

      {selectedBtn === 'Reports' && (
          <ReportDashboard />
      )}

      {selectedBtn === 'History' && (
          <AdminHistoryWindow />
      )}
    </>
  );
};

export default AdminWindow;
