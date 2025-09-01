import MainLayout from '../components/templates/MainLayout';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { useDispatch, useSelector } from 'react-redux';
import CreateProjectPopUp from '../components/organisms/CreateProjectPopUp';
import BaseBtn from '../components/atoms/buttons/BaseBtn';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import CreateAccountPopup from '../components/organisms/CreateAccountPopup';
import { UserRole } from '@tms/shared';
import TableWindowLayout, {
  EmpRow,
  ProjectRow,
} from '../components/templates/TableWindowLayout';
import { useAllUsersIncludingInactive } from '../hooks/useUsers';
import { listProjects, ProjectListItem } from '../api/project';
import { select_btn } from '../store/slices/dashboardNavSlice';
import EmpTable from '../components/organisms/EmpTable';
import ProjectTable from '../components/organisms/ProjectTable';
import ProjectTableToolbar from '../components/molecules/ProjectTableToolbar';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EmpTableToolbar, { EmpRoleFilter } from '../components/molecules/EmpTableToolbar';
import { he } from 'zod/v4/locales/index.cjs';
import { Height } from '@mui/icons-material';

const AdminPage = () => {
  const roles = useMemo(() => [UserRole.Emp, UserRole.Supervisor] as const, []);
  const { users, isLoading, error, refreshUsers } = useAllUsersIncludingInactive(roles as unknown as UserRole[]);

  const [isProjectPopupOpen, setIsProjectPopupOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [empRoleFilter, setEmpRoleFilter] = useState<EmpRoleFilter>('all');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
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

  const projectOptions = useMemo(
    () => projects.map((p) => ({ id: p._id, name: p.projectName })),
    [projects]
  );

  const rows: EmpRow[] = useMemo(() => {
    // Build quick lookup for supervised and member projects by user id
    const supervisedByUserId = new Map<string, Set<string>>();
    const memberByUserId = new Map<string, Set<string>>();

    projects.forEach((p) => {
      (p.employees || []).forEach((e) => {
        if (!e?._id) return;
        if (!memberByUserId.has(e._id)) memberByUserId.set(e._id, new Set());
        memberByUserId.get(e._id)!.add(p._id);
      });
      if (p.supervisor?._id) {
        const sid = p.supervisor._id;
        if (!supervisedByUserId.has(sid)) supervisedByUserId.set(sid, new Set());
        supervisedByUserId.get(sid)!.add(p._id);
      }
    });

    const mappedRows = users.map((user) => {
      const uid = (user as any)._id as string;
      const supervisedSet = supervisedByUserId.get(uid);
      const memberSet = memberByUserId.get(uid);
      const supervisedIds = supervisedSet ? Array.from(supervisedSet) : [];
      const memberIds = memberSet ? Array.from(memberSet) : [];
      const idToName = new Map(projects.map((p) => [p._id, p.projectName] as const));
      return {
        id: uid,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        designation: user.designation || '',
        // Derive role based on whether the user supervises any projects
        role: supervisedIds.length > 0 ? 'supervisor' : 'emp',
        supervisedProjects: supervisedIds.map((id) => idToName.get(id) || id).sort(),
        memberProjects: memberIds.map((id) => idToName.get(id) || id).sort(),
        status: typeof user.status === 'boolean'
          ? user.status
            ? 'Active'
            : 'Inactive'
          : (user.status === 'Active' || user.status === 'Inactive'
            ? user.status
            : 'Active'),
        contactNumber: user.contactNumber || '',
        createdAt: user.createdAt || '',
        supervisedProjectIds: supervisedIds,
        memberProjectIds: memberIds,
      } as EmpRow & { supervisedProjectIds: string[]; memberProjectIds: string[] };
    });

    console.log('Mapped rows:', {
      totalUsers: users.length,
      sampleUsers: users.slice(0, 3).map(u => ({ 
        id: u._id, 
        email: u.email, 
        status: u.status,
        mappedStatus: mappedRows.find(r => r.id === u._id)?.status
      }))
    });

    return mappedRows;
  }, [users, projects]);

  const filteredRows: EmpRow[] = useMemo(() => {
    let res: (EmpRow & { supervisedProjectIds?: string[]; memberProjectIds?: string[] })[] = rows as any;
    
    console.log('Filtering rows:', { 
      totalRows: res.length, 
      empRoleFilter, 
      selectedProjectIds, 
      statusFilter,
      sampleStatuses: res.slice(0, 3).map(r => ({ id: r.id, status: r.status }))
    });
    
    if (empRoleFilter !== 'all') {
      res = res.filter((r) => (r.role || '').toLowerCase() === (empRoleFilter === 'employee' ? 'emp' : 'supervisor'));
      console.log('After role filter:', res.length);
    }
    if (selectedProjectIds.length > 0) {
      const set = new Set(selectedProjectIds);
      res = res.filter((r) => {
        const sp = r.supervisedProjectIds || [];
        const mp = r.memberProjectIds || [];
        return sp.some((id) => set.has(id)) || mp.some((id) => set.has(id));
      });
      console.log('After project filter:', res.length);
    }
    if (statusFilter !== 'all') {
      res = res.filter((r) => r.status === statusFilter);
      console.log('After status filter:', res.length);
    }
    return res;
  }, [rows, empRoleFilter, selectedProjectIds, statusFilter]);

  // Project rows
  const projectRows: ProjectRow[] = useMemo(() => projects.map((p) => ({
    id: p._id,
    projectName: p.projectName,
    billable: p.billable ? 'Yes' : 'No',
    createdAt: p.createdAt,
    employees: (p.employees || []).map((e) => ({
      id: e._id,
      name: `${e.firstName} ${e.lastName}`.trim(),
      designation: e.designation,
      email: e.email,
    })),
    supervisor: p.supervisor
      ? {
          id: p.supervisor._id,
          name: `${p.supervisor.firstName} ${p.supervisor.lastName}`.trim(),
          designation: p.supervisor.designation,
          email: p.supervisor.email,
        }
      : null,
  })), [projects]);

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

  const [billable, setBillable] = useState<'all' | 'Yes' | 'No'>('all');

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
            <Box sx={{ padding: 2, height: '93%' }}>
<TableWindowLayout
              title="Employee Accounts"
              filter={<EmpTableToolbar 
                roleFilter={empRoleFilter} 
                onRoleFilterChange={setEmpRoleFilter} 
                projectsOptions={projectOptions} 
                selectedProjectIds={selectedProjectIds} 
                onSelectedProjectIdsChange={setSelectedProjectIds}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />}
              buttons={[
                <Box sx={{ mt: 2, ml: 2 }}>
                  <BaseBtn
                    onClick={handleOpenPopup}
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                  >
                    Employee
                  </BaseBtn>
                </Box>,
              ]}
              table={<EmpTable rows={filteredRows} />}
            />
            </Box>
            
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
            <Box sx={{ padding: 2 ,height:'100%'}}>
              <TableWindowLayout
              title="Projects"
              filter={
                <ProjectTableToolbar
                  billable={billable}
                  onBillableChange={setBillable}
                />
              }
              buttons={[
                <Box sx={{ mt: 2, ml: 2 }}>
                  <BaseBtn
                    onClick={() => setIsProjectPopupOpen(true)}
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                  >
                    Project
                  </BaseBtn>
                </Box>,
              ]}
              table={
                <ProjectTable
                  rows={projectRows}
                  billableFilter={billable}
                  onRefresh={async () => {
                    try {
                      const resp = await listProjects();
                      const data = resp.data?.projects as ProjectListItem[];
                      setProjects(Array.isArray(data) ? data : []);
                      // Also refresh users so Emp table reflects role changes (e.g., supervisor promotions/demotions)
                      await refreshUsers();
                    } catch {}
                  }}
                />
              }
            />
            </Box>
            
          )}

          <CreateProjectPopUp
            open={isProjectPopupOpen}
            onClose={async () => {
              setIsProjectPopupOpen(false);
              try {
                const resp = await listProjects();
                const data = resp.data?.projects as ProjectListItem[];
                setProjects(Array.isArray(data) ? data : []);
                // Keep user roles in sync after project creation
                await refreshUsers();
              } catch {}
            }}
          />
        </div>
      )}
    </MainLayout>
  );
};

export default AdminPage;
