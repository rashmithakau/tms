import { Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { red } from '@mui/material/colors';

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

  // Convert decimal hours to HH.MM format for display
  const formatTimeDisplay = (decimalHours?: number): string => {
    if (!decimalHours || decimalHours === 0) return '-';
    
    // Round to 2 decimal places to avoid floating-point precision issues
    const roundedHours = Math.round(decimalHours * 100) / 100;
    
    const hours = Math.floor(roundedHours);
    const minutes = Math.round((roundedHours - hours) * 60);
    
    // Ensure minutes don't exceed 59
    if (minutes >= 60) {
      return `${(hours + 1).toString().padStart(2, '0')}.00`;
    }
    
    // Format as HH.MM
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${formattedHours}.${formattedMinutes}`;
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Project</TableCell>
          <TableCell>Tasks</TableCell>
          <TableCell>Planned Hours</TableCell>
          <TableCell>Hours Spent</TableCell>
          <TableCell>Billable Type</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row._id} hover sx={{color:red[400]}}>
            <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
            <TableCell>{row.project}</TableCell>
            <TableCell>{row.tasks}</TableCell>
            <TableCell>{formatTimeDisplay(row.plannedHours)}</TableCell>
            <TableCell>{formatTimeDisplay(row.hoursSpent)}</TableCell>
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



