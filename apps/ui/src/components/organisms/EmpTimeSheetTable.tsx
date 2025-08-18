import { Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

export type EmpTimesheetRow = {
  _id: string;
  date: string;
  project: string;
  tasks: string;
  billableType: 'Billable' | 'Non Billable';
  status: 'Pending' | 'Approved' | 'Rejected';
  plannedHours?: number;
  hoursSpent?: number;
  description?: string;
};

export default function EmpTimeSheetTable({ rows }: { rows: EmpTimesheetRow[] }) {
  const statusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Project</TableCell>
          <TableCell>Tasks</TableCell>
          <TableCell>Billable Type</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row._id} hover>
            <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
            <TableCell>{row.project}</TableCell>
            <TableCell>{row.tasks}</TableCell>
            <TableCell>{row.billableType}</TableCell>
            <TableCell>
              <Chip size="small" label={row.status} color={statusColor(row.status) as any} />
            </TableCell>
            <TableCell align="right">
              <IconButton size="small" aria-label="edit">
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="delete" sx={{ ml: 1 }}>
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}



