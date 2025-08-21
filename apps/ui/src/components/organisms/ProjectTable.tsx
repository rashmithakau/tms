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
import ProjectTableToolbar from '../molecules/ProjectTableToolbar';
import ActionButtons from '../molecules/ActionButtons';

// Add ConfirmDialog import if you have a custom dialog component
import ConfirmDialog from '../molecules/ConfirmDialog';

interface ProjectTableProps {
  rows: ProjectRow[];
  onRefresh?: () => Promise<void> | void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ rows, onRefresh }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [billable, setBillable] = useState<'all' | 'Yes' | 'No'>('all');
  // Add confirm dialog state for delete
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return rows.filter((r) => {
      const billableOk =
        billable === 'all' ||
        (billable === 'Yes' ? r.billable.toLowerCase() === 'yes' : r.billable.toLowerCase() === 'no');
      const text = `${r.projectName} ${r.supervisor?.name ?? ''} ${
        r.supervisor?.designation ?? ''
      }`.toLowerCase();
      const matches = s === '' || text.includes(s);
      return billableOk && matches;
    });
  }, [rows, search, billable]);

  return (
    <>
      <ProjectTableToolbar
        search={search}
        onSearch={setSearch}
        billable={billable}
        onBillableChange={setBillable}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Project Name</TableCell>
            <TableCell>Billable Type</TableCell>
            <TableCell>Supervisor</TableCell>
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
                      ? `${row.supervisor.name} - ${row.supervisor.designation}`
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
            await deleteProject(confirm.id);
            if (onRefresh) await onRefresh();
          }
          setConfirm({ open: false });
        }}
      />
    </>
  );
};

export default ProjectTable;