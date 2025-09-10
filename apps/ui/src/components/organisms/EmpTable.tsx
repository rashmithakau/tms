import React, { useState } from 'react';
import StatusChip from '../atoms/buttons/StatusChip';
import ActionButtons from '../molecules/ActionButtons';
import ConfirmDialog from '../molecules/ConfirmDialog';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { deleteUser } from '../../api/user';
import { useToast } from '../contexts/ToastContext';
import DataTable, { DataTableColumn } from './DataTable';
import { useTheme } from '@mui/material/styles';
export interface TimeSheetRow {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  team?: string;
  status: 'Active' | 'Inactive' | string;
  contactNumber: string;
  createdAt?: string;
}

interface TimeSheetTableProps {
  rows: TimeSheetRow[];
  onRefresh?: () => Promise<void>;
}

const EmpTable: React.FC<TimeSheetTableProps> = ({ rows, onRefresh }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });
  const selectedRow = rows.find((r) => r.id === confirm.id);
  const toast = useToast();
  const theme = useTheme();

  const columns: DataTableColumn<TimeSheetRow>[] = [
    { label: '', key: 'empty', render: () => null },
    { label: 'Email', key: 'email', render: (row) => row.email },
    {
      label: 'Name',
      key: 'name',
      render: (row) => `${row.firstName} ${row.lastName}`.trim(),
    },
    {
      label: 'Contact Number',
      key: 'contactNumber',
      render: (row) => row.contactNumber,
    },
    {
      label: 'Created At',
      key: 'createdAt',
      render: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '',
    },
    {
      label: 'Status',
      key: 'status',
      render: (row) => (
        <StatusChip
          status={
            row.status === 'Active' || (row as any).status === true
              ? 'Active'
              : 'Inactive'
          }
        />
      ),
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <span>
          <ActionButtons
            onEdit={() => setEditingId(row.id ?? null)}
            onDelete={() => setConfirm({ open: true, id: row.id })}
          />
        </span>
      ),
    },
  ];
  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id ?? ''}
      />
      <ConfirmDialog
        open={confirm.open}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        icon={<DeleteRoundedIcon />}
        confirmText="Delete"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={async () => {
          if (confirm.id) {
            try {
              await deleteUser(confirm.id);
              toast.success('User deleted');
              if (onRefresh) await onRefresh();
            } catch (e) {
              toast.error('Failed to delete user');
            }
          }
          setConfirm({ open: false });
        }}
      />
    </>
  );
};

export default EmpTable;
