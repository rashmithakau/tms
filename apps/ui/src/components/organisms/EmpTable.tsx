import React from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';

import StatusChip from '../atoms/buttons/StatusChip';
import ActionButtons from '../molecules/ActionButtons';

export interface TimeSheetRow {
  email: string;
  firstName: string;
  lastName: string;
  designation: string;
  status: 'Active' | 'Inactive' | string;
  contactNumber: string;
  createdAt?: string;
}

interface TimeSheetTableProps {
  rows: TimeSheetRow[];
}

const EmpTable: React.FC<TimeSheetTableProps> = ({ rows }) => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>Email</TableCell>
          <TableCell>First Name</TableCell>
          <TableCell>Last Name</TableCell>
          <TableCell>Designation</TableCell>
          <TableCell>Contact Number</TableCell>
          <TableCell>Created At</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => (
          <React.Fragment key={index}>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.firstName}</TableCell>
              <TableCell>{row.lastName}</TableCell>
              <TableCell>{row.designation}</TableCell>
              <TableCell>{row.contactNumber}</TableCell>
              <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''}</TableCell>
              <TableCell>
                <StatusChip status={row.status?"Active":"Inactive"} />
              </TableCell>
              <TableCell>
                <ActionButtons
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </TableCell>
            </TableRow>
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

export default EmpTable;
