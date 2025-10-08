import React, { useState } from 'react';
import StatusChip from '../../atoms/common/button/StatusChip';
import ActionButtons from '../../molecules/common/other/ActionButtons';
import ConfirmDialog from '../../molecules/common/dialog/ConfirmDialog';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { deleteUser } from '../../../api/user';
import { useToast } from '../../../contexts/ToastContext';
import DataTable from './DataTable';
import { DataTableColumn, EmployeeRow, EmpTableProps } from '../../../interfaces';
import { useTheme } from '@mui/material/styles';

const EmpTable: React.FC<EmpTableProps> = ({ rows, onRefresh, onEditRow }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });
  const selectedRow = rows.find((r) => r.id === confirm.id);
  const toast = useToast();
  const theme = useTheme();

  const columns: DataTableColumn<EmployeeRow>[] = [
    { label: '', key: 'empty', render: () => null },
    { 
      label: 'Employee ID', 
      key: 'employee_id', 
      render: (row) => row.employee_id || '-' 
    },
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
            onEdit={() => {
              if (onEditRow) onEditRow(row);
              else setEditingId(row.id ?? null);
            }}
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
