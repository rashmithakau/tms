import React, { useMemo, useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  Typography,
  TableContainer,
} from '@mui/material';
import { deleteProject } from '../../api/project';
import { ProjectRow } from '../templates/TableWindowLayout';
import ProjectStaffManager from './ProjectStaffManager';
import ViewProjectTeam from './ViewProjectTeam';
import ActionButtons from '../molecules/ActionButtons';
import ConfirmDialog from '../molecules/ConfirmDialog';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useToast } from '../contexts/ToastContext';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useTheme } from '@mui/material/styles';

interface ProjectTableProps {
  rows: ProjectRow[];
  onRefresh?: () => Promise<void> | void;
  billableFilter?: 'all' | 'Yes' | 'No';
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  rows,
  onRefresh,
  billableFilter = 'all',
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  //  confirm dialog state for delete
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });
  // ViewProjectTeam popup
  const [viewTeamProject, setViewTeamProject] = useState<ProjectRow | null>(
    null
  );
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
  return (
    <>
      <TableContainer sx={{ maxHeight: '70vh' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Project Name</TableCell>
              <TableCell>Billable Type</TableCell>
              <TableCell>Supervisor Name</TableCell>
              <TableCell>Supervisor Email</TableCell>
              <TableCell>Team Members</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => {
              const emptySupervised = !row.supervisor || !row.supervisor.name;
              const emptyEmail = !row.supervisor || !row.supervisor.email;
              return (
                <React.Fragment key={row.id}>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>{row.projectName}</TableCell>
                    <TableCell>
                      {row.billable
                        ? row.billable.charAt(0).toUpperCase() +
                          row.billable.slice(1).toLowerCase()
                        : ''}
                    </TableCell>
                    <TableCell>
                      {emptySupervised ? (
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                          }}
                        >
                          No supervisor assigned
                        </Typography>
                      ) : row.supervisor ? (
                        row.supervisor.name
                      ) : (
                        ''
                      )}
                    </TableCell>
                    <TableCell>
                      {emptyEmail ? (
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                          }}
                        >
                          No supervisor assigned
                        </Typography>
                      ) : row.supervisor ? (
                        row.supervisor.email
                      ) : (
                        ''
                      )}
                    </TableCell>
                    <TableCell>
                      <BaseBtn
                        variant="outlined"
                        onClick={() => setViewTeamProject(row)}
                        size="small"
                      >
                        View Team
                      </BaseBtn>
                    </TableCell>
                    <TableCell>
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString()
                        : ''}
                    </TableCell>
                    <TableCell>
                        <span>
                          <ActionButtons
                            onEdit={() => setEditingId(row.id)}
                            onDelete={() =>
                              setConfirm({ open: true, id: row.id })
                            }
                          />
                        </span>
                    </TableCell>
                  </TableRow>
                  {editingId === row.id && (
                    <ProjectStaffManager
                      open={true}
                      onClose={() => setEditingId(null)}
                      projectId={row.id}
                      initialEmployees={row.employees ?? []}
                      initialSupervisor={row.supervisor ?? null}
                      onSaved={async () => {
                        setEditingId(null);
                        if (onRefresh) await onRefresh();
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
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
    </>
  );
};

export default ProjectTable;
