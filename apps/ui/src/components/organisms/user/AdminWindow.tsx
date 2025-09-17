import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserRole } from '@tms/shared';
import { useAllUsersIncludingInactive } from '../../../hooks/api/useUsers';
import { listProjects, ProjectListItem } from '../../../api/project';
import { select_btn } from '../../../store/slices/dashboardNavSlice';
import EmployeeSection from '../../molecules/employee/EmployeeSection';
import ProjectsSection from '../../molecules/project/ProjectsSection';
import TeamsSection from '../../molecules/team/TeamsSection';
import CreateAccountPopup from '../authentication/popup/CreateAccountPopup';
import CreateProjectPopUp from '../popup/CreateProjectPopUp';
import CreateTeamPopUp from '../popup/CreateTeamPopUp';
import { EmpRow, ProjectRow, TeamRow } from '../../templates/layout/TableWindowLayout';
import { listTeams, TeamListItem } from '../../../api/team';
import MyTimesheetsWindow from '../timesheet/MyTimesheetsWindow';
import ReviewTimesheetsWindow from '../timesheet/ReviewTimesheetsWindow';

const AdminWindow: React.FC = () => {
  const roles = useMemo(() => [UserRole.Emp, UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin] as const, []);
  const { users, isLoading, error, refreshUsers } =
    useAllUsersIncludingInactive(roles as unknown as UserRole[]);

  const [isTeamPopupOpen, setIsTeamPopupOpen] = useState(false);
  const [teamsKey, setTeamsKey] = useState(0);
  const [isProjectPopupOpen, setIsProjectPopupOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'Active' | 'Inactive'
  >('all');
  const [billable, setBillable] = useState<'all' | 'Yes' | 'No'>('all');
  
  const dispatch = useDispatch();
  const selectedBtn = useSelector(
    (state: any) => state.dashboardNav.selectedBtn
  );

  useEffect(() => {
    // Ensure the correct tab is selected when visiting Admin page
    if (selectedBtn !== 'Employee') {
      dispatch(select_btn('Employee'));
    }
    
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

  const rows: EmpRow[] = useMemo(() => {
    const mappedRows = users.map((user) => {
      const uid = (user as any)._id as string;
      return {
        id: uid,
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
      } as EmpRow;
    });

    return mappedRows;
  }, [users]);

  const filteredRows: EmpRow[] = useMemo(() => {
    let res = rows;

    if (statusFilter !== 'all') {
      res = res.filter((r) => r.status === statusFilter);
    }
    return res;
  }, [rows, statusFilter]);

  // Project rows
  const projectRows: ProjectRow[] = useMemo(
    () =>
      projects.map((p) => ({
        id: p._id,
        projectName: p.projectName,
        billable: p.billable ? 'Yes' : 'No',
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
    // Refresh the table data after account creation
    refreshUsers();
  };

  const handleCloseTeamPopup = async () => {
    setIsTeamPopupOpen(false);
    setTeamsKey((k) => k + 1);
    // Refresh teams data after team creation
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
      // Keep user roles in sync after project creation
      await refreshUsers();
    } catch {}
  };

  return (
    <>
      {selectedBtn === 'Employee' && (
        <div>
          <EmployeeSection
            error={error || undefined}
            isLoading={isLoading}
            rows={filteredRows}
            projectOptions={projectOptions}
            selectedProjectIds={selectedProjectIds}
            onSelectedProjectIdsChange={setSelectedProjectIds}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onAddEmployee={handleOpenPopup}
          />
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
        </div>
      )}

      {selectedBtn === 'Teams' && (
        <div>
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
        </div>
      )}

            {selectedBtn === 'My Timesheets' && (
        <MyTimesheetsWindow/>
      )}

                  {selectedBtn === 'Review Timesheets' && (
        <ReviewTimesheetsWindow/>
      )}
    </>
  );
};

export default AdminWindow;
