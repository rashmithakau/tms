import React, { useMemo, useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
} from '@mui/material';
import { deleteProject } from '../../api/project';

import { ProjectRow } from '../templates/TableWindowLayout';
import ProjectStaffManager from './ProjectStaffManager';

import ActionButtons from '../molecules/ActionButtons';

// Add ConfirmDialog import if you have a custom dialog component
import ConfirmDialog from '../molecules/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';

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
  // Add confirm dialog state for delete
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });
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

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Project Name</TableCell>
            <TableCell>Billable Type</TableCell>
            <TableCell>Supervisor Name</TableCell>
            <TableCell>Supervisor Email</TableCell>
            <TableCell>Supervisor Designation</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((row) => (
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
                  {row.supervisor
                    ? row.supervisor.designation
                      ? `${row.supervisor.name} `
                      : row.supervisor.name
                    : ''}
                </TableCell>
                <TableCell>
                  {row.supervisor
                    ? row.supervisor.designation
                      ? `${row.supervisor.email}`
                      : row.supervisor.name
                    : ''}
                </TableCell>
                <TableCell>
                  {row.supervisor
                    ? row.supervisor.designation
                      ? ` ${row.supervisor.designation} `
                      : row.supervisor.name
                    : ''}
                </TableCell>
                <TableCell>
                  {row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : ''}
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit or Delete">
                    <span>
                      <ActionButtons
                        onEdit={() => setEditingId(row.id)}
                        onDelete={() => setConfirm({ open: true, id: row.id })}
                      />
                    </span>
                  </Tooltip>
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
          ))}
        </TableBody>
      </Table>
      <ConfirmDialog
        open={confirm.open}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
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
    </>
  );
};

export default ProjectTable;
