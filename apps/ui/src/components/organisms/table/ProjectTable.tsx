import React, { useMemo, useState } from 'react';
import { deleteProject } from '../../../api/project';
import { ProjectRow } from '../../../interfaces/component/table/ITableRowTypes';
import { ProjectTableProps } from '../../../interfaces';
import ViewProjectTeam from '../popup/ViewProjectTeam';
import ActionButtons from '../../molecules/common/other/ActionButtons';
import ConfirmDialog from '../../molecules/common/dialog/ConfirmDialog';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useToast } from '../../../contexts/ToastContext';
import BaseBtn from '../../atoms/common/button/BaseBtn';
import { useTheme } from '@mui/material/styles';
import DataTable from './DataTable';
import { DataTableColumn } from '../../../interfaces';
import ProjectStaffManager from '../popup/ProjectStaffManager';

const ProjectTable: React.FC<ProjectTableProps> = ({
  rows,
  onRefresh,
  billableFilter = 'all',
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });

  const [viewTeamProject, setViewTeamProject] = useState<ProjectRow | null>(
    null
  );

  const [staffManagerTeam, setStaffManagerTeam] = useState<ProjectRow | null>(null);
  const toast = useToast();

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const billableOk =
        billableFilter === 'all' ||
        (billableFilter === 'Yes'
          ? r.billable.toLowerCase() === 'yes'
          : r.billable.toLowerCase() === 'no');

      return billableOk;
    });
  }, [rows, billableFilter]);
  const theme = useTheme();

  const columns: DataTableColumn<ProjectRow>[] = [
    { label: '', key: 'empty', render: () => null },
    {
      label: 'Project Name',
      key: 'projectName',
      render: (row) => row.projectName,
    },
    { label: 'Billable ', key: 'billable', render: (row) => row.billable },
    {
      label: 'Supervisor Name',
      key: 'supervisorName',
      render: (row) =>
        row.supervisor?.name || (
          <span style={{ color: theme.palette.text.secondary}}>No supervisor assigned</span>
        ),
    },
    {
      label: 'Supervisor Email',
      key: 'supervisorEmail',
      render: (row) =>
        row.supervisor?.email || (
          <span style={{ color: theme.palette.text.secondary }}>No supervisor assigned</span>
        ),
    },
    {
      label: 'Team Members',
      key: 'teamMembers',
      render: (row) => (
        <BaseBtn
          variant="outlined"
          onClick={() => setViewTeamProject(row)}
          size="small"
        >
          View Team
        </BaseBtn>
      ),
    },
    {
      label: 'Created On',
      key: 'createdAt',
      render: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '',
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <ActionButtons
          onEdit={() => setStaffManagerTeam(row)}
          onDelete={() => setConfirm({ open: true, id: row.id })}
        />
      ),
    },
  ];
  return (
    <>
      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(row) => row.id}
      />
      <ConfirmDialog
        open={confirm.open}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        icon={<DeleteRoundedIcon />}
        confirmText="Delete"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={async () => {
          if (confirm.id) {
            try {
              await deleteProject(confirm.id);
              toast.success('Project deleted');
              if (onRefresh) await onRefresh();
            } catch (e) {
              toast.error('Failed to delete project');
            }
          }
          setConfirm({ open: false });
        }}
      />

      {/* ViewProjectTeam Popup */}
      <ViewProjectTeam
        open={!!viewTeamProject}
        onClose={() => setViewTeamProject(null)}
        project={viewTeamProject}
      />

      <ProjectStaffManager
        open={!!staffManagerTeam}
        onClose={() => setStaffManagerTeam(null)}
        projectId={staffManagerTeam?.id || ''}
        initialEmployees={staffManagerTeam?.employees || []}
        initialSupervisor={staffManagerTeam?.supervisor || null}
        onSaved={() => {
         
          if (onRefresh) {
            onRefresh();
          }
        }}
      />
    </>
  );
};

export default ProjectTable;
