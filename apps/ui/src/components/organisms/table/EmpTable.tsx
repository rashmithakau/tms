import React, { useState, useMemo } from 'react';
import StatusChip from '../../atoms/common/button/StatusChip';
import ActionButtons from '../../molecules/common/other/ActionButtons';
import ConfirmDialog from '../../molecules/common/dialog/ConfirmDialog';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { deleteUser } from '../../../api/user';
import { useToast } from '../../../contexts/ToastContext';
import DataTable from './DataTable';
import { DataTableColumn, EmployeeRow, EmpTableProps } from '../../../interfaces';
import { useTheme } from '@mui/material/styles';
import { formatContactNumber } from '../../../utils';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '@tms/shared';

const   EmpTable: React.FC<EmpTableProps> = ({ rows, onRefresh, onEditRow, roleFilter = 'all' }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });
  const selectedRow = rows.find((r) => r.id === confirm.id);
  const toast = useToast();
  const theme = useTheme();
  const { authState } = useAuth();
  const currentUserRole = authState.user?.role as UserRole | undefined;

  const normalizeRoleKey = (roleValue: string | undefined): 'admin' | 'supervisorAdmin' | 'superAdmin' | 'supervisor' | 'emp' | undefined => {
    if (!roleValue) return undefined;
    const map: Record<string, string> = {
      'Admin': 'admin',
      'Supervisor Admin': 'supervisorAdmin',
      'Super Admin': 'superAdmin',
      'Supervisor': 'supervisor',
      'Employee': 'emp'
    };
    // If already lower-case key, keep it
    const maybeKey = map[roleValue] || roleValue;
    switch (maybeKey) {
      case 'admin':
      case 'supervisorAdmin':
      case 'superAdmin':
      case 'supervisor':
      case 'emp':
        return maybeKey as any;
      default:
        return undefined;
    }
  };

  const canDeleteRow = (row: EmployeeRow): boolean => {
    if (!currentUserRole) return false;
    const targetRoleKey = normalizeRoleKey(typeof row.role === 'string' ? row.role : undefined);
    if (!targetRoleKey) return false;
    // Super Admin can delete Admin and Supervisor Admin only
    if (currentUserRole === UserRole.SuperAdmin) {
      return targetRoleKey === 'admin' || targetRoleKey === 'supervisorAdmin';
    }
    // Admin and Supervisor Admin can delete Supervisor and Employee
    if (currentUserRole === UserRole.Admin || currentUserRole === UserRole.SupervisorAdmin) {
      return targetRoleKey === 'supervisor' || targetRoleKey === 'emp';
    }
    return false;
  };

  const isRowInactive = (row: EmployeeRow): boolean => {
    return String(row.status) === 'Inactive' || (row as any).status === false;
  };

  const filteredRows = useMemo(() => {
    if (roleFilter === 'all') {
      return rows;
    }
    return rows.filter((row) => {
      // Handle both raw role values and display text
      const rowRole = row.role;
      if (typeof rowRole === 'string') {
        // If it's display text, convert back to enum value for comparison
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
  }, [rows, roleFilter]);

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
      label: 'Role',
      key: 'role',
      render: (row) => row.role || '-',
    },
    {
      label: 'Contact Number',
      key: 'contactNumber',
      render: (row) => formatContactNumber(row.contactNumber),
    },
    {
      label: 'Created On',
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
      render: (row) => {
        const allowed = canDeleteRow(row);
        const inactive = isRowInactive(row);

        const isAdminLevelViewer = currentUserRole === UserRole.Admin || currentUserRole === UserRole.SupervisorAdmin;

        const rowRoleKey = normalizeRoleKey(typeof row.role === 'string' ? row.role : undefined);
        const disableEdit = !!(isAdminLevelViewer && (rowRoleKey === 'admin' || rowRoleKey === 'supervisorAdmin'));

        const showDelete = isAdminLevelViewer ? true : allowed;
        const disableDelete = inactive || (isAdminLevelViewer ? !allowed : false);

        return (
          <span>
            <ActionButtons
              onEdit={() => {
                if (onEditRow) onEditRow(row);
                else setEditingId(row.id ?? null);
              }}
              onDelete={() => setConfirm({ open: true, id: row.id })}
              disableEdit={disableEdit}
              showDelete={showDelete}
              disableDelete={disableDelete}
            />
          </span>
        );
      },
    },
  ];
  return (
    <>
      <DataTable
        columns={columns}
        rows={filteredRows}
        getRowKey={(row) => row.id ?? ''}
        onRowClick={(row) => {
          if (onEditRow) onEditRow(row);
        }}
      />
      <ConfirmDialog
        open={confirm.open}
        title="Delete Employee"
        message="Are you sure want to delete this Account?"
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
