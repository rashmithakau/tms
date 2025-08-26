import React from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import StatusChip from '../atoms/buttons/StatusChip';
import ActionButtons from '../molecules/ActionButtons';
import LensSharpIcon from '@mui/icons-material/LensSharp';

export interface TimeSheetRow {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  designation: string;
  role?: string;
  supervisedProjects?: string[];
  memberProjects?: string[] ;
  status: 'Active' | 'Inactive' | string;
  contactNumber: string;
  createdAt?: string;
}

interface TimeSheetTableProps {
  rows: TimeSheetRow[];
}

const EmpTable: React.FC<TimeSheetTableProps> = ({ rows }) => {
  const theme = useTheme();
  return (
    <Table size="small">
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
          const emptySupervised = !row.supervisedProjects || row.supervisedProjects.length === 0;
          const emptyMember = !row.memberProjects || row.memberProjects.length === 0;
          return (
            <React.Fragment key={row.id ?? `${row.email}-${row.createdAt ?? ''}`}>
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
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: theme.palette.text.secondary }}>
                     Not supervising any projects
                    </Typography>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', columnGap: 8, rowGap: 6 }}>
                      {row.supervisedProjects!.map((name, idx) => (
                        <div key={`sup-${name}-${idx}`} style={{ display: 'flex', alignItems: 'center' }}>
                          <LensSharpIcon sx={{ fontSize: 8, color: theme.palette.text.disabled, mr: 0.75 }} />
                          <Typography variant="body2">{name}</Typography>
                        </div>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {emptyMember ? (
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: theme.palette.text.secondary }}>
                      Not a member of any projects
                    </Typography>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', columnGap: 8, rowGap: 6 }}>
                      {row.memberProjects!.map((name, idx) => (
                        <div key={`mem-${name}-${idx}`} style={{ display: 'flex', alignItems: 'center' }}>
                          <LensSharpIcon sx={{ fontSize: 8, color: theme.palette.text.disabled, mr: 0.75 }} />
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
                  <StatusChip status={row.status ? 'Active' : 'Inactive'} />
                </TableCell>
                <TableCell>
                  <ActionButtons onEdit={() => {}} onDelete={() => {}} />
                </TableCell>
              </TableRow>
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default EmpTable;
