import React, { useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import StatusChip from '../atoms/buttons/StatusChip';
import ActionButtons from '../molecules/ActionButtons';
import LensSharpIcon from '@mui/icons-material/LensSharp';
import ConfirmDialog from '../molecules/ConfirmDialog';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { deleteUser } from '../../api/user';
import { useToast } from '../contexts/ToastContext';
export interface TimeSheetRow {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  designation: string;
  role?: string;
  supervisedProjects?: string[];
  memberProjects?: string[];
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
  const theme = useTheme();
  const toast = useToast();
  return (
    <>
      <TableContainer sx={{ maxHeight: '70vh' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Email</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Supervisor Of</TableCell>
              <TableCell>Member Of</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const emptySupervised =
                !row.supervisedProjects || row.supervisedProjects.length === 0;
              const emptyMember =
                !row.memberProjects || row.memberProjects.length === 0;
              return (
                <React.Fragment
                  key={row.id ?? `${row.email}-${row.createdAt ?? ''}`}
                >
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.firstName}</TableCell>
                    <TableCell>{row.lastName}</TableCell>
                    <TableCell>{row.designation}</TableCell>
                    <TableCell>
                      {row.role === 'emp'
                        ? 'Employee'
                        : row.role === 'supervisor'
                        ? 'Supervisor'
                        : row.role || ''}
                    </TableCell>
                    <TableCell>
                      {emptySupervised ? (
                        <Typography
                          variant="body2"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Not supervising any projects
                        </Typography>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            columnGap: 8,
                            rowGap: 6,
                          }}
                        >
                          {row.supervisedProjects!.map((name, idx) => (
                            <div
                              key={`sup-${name}-${idx}`}
                              style={{ display: 'flex', alignItems: 'center' }}
                            >
                              <LensSharpIcon
                                sx={{
                                  fontSize: 8,
                                  color: theme.palette.text.disabled,
                                  mr: 0.75,
                                }}
                              />
                              <Typography variant="body2">{name}</Typography>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {emptyMember ? (
                        <Typography
                          variant="body2"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Not a member of any projects
                        </Typography>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            columnGap: 8,
                            rowGap: 6,
                          }}
                        >
                          {row.memberProjects!.map((name, idx) => (
                            <div
                              key={`mem-${name}-${idx}`}
                              style={{ display: 'flex', alignItems: 'center' }}
                            >
                              <LensSharpIcon
                                sx={{
                                  fontSize: 8,
                                  color: theme.palette.text.disabled,
                                  mr: 0.75,
                                }}
                              />
                              <Typography variant="body2">{name}</Typography>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{row.contactNumber}</TableCell>
                    <TableCell>
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString()
                        : ''}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.status === 'Active' || (row as any).status === true ? 'Active' : 'Inactive'} />
                    </TableCell>
                    <TableCell>
                      <span>
                        <ActionButtons
                          onEdit={() => setEditingId(row.id ?? null)}
                          onDelete={() =>
                            setConfirm({ open: true, id: row.id })
                          }
                        />
                      </span>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <ConfirmDialog
        open={confirm.open}
        title={`Delete ${
          selectedRow?.role === 'emp'
            ? 'Employee'
            : selectedRow?.role === 'supervisor'
            ? 'Supervisor'
            : selectedRow?.role || ''
        }`}
        message={`Are you sure you want to delete this ${
          selectedRow?.role === 'emp'
            ? 'Employee'
            : selectedRow?.role === 'supervisor'
            ? 'Supervisor'
            : selectedRow?.role || ''
        }? This action cannot be undone.`}
        icon={<DeleteRoundedIcon />}
        confirmText="Delete"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={async () => {
          if (confirm.id) {
            try {
              console.log('Attempting to delete user:', confirm.id, 'with role:', selectedRow?.role);
              await deleteUser(confirm.id);
              toast.success('User deleted');
              if (onRefresh) await onRefresh();
            } catch (e) {
              console.error('Delete user error:', e);
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
