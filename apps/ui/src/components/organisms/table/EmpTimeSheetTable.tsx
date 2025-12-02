import { Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { red } from '@mui/material/colors';
import { TimesheetStatus } from '@tms/shared';
import { EmpTimesheetRow } from '../../../interfaces';

export default function EmpTimeSheetTable({ rows }: { rows: EmpTimesheetRow[] }) {
  const statusColor = (status: TimesheetStatus) => {
    switch (status) {
      case TimesheetStatus.Approved:
        return 'success';
      case TimesheetStatus.Rejected:
        return 'error';
      case TimesheetStatus.Pending:
        return 'warning';
      default:
        return 'default';
    }
  };

 
  const canEditTimesheet = (status: TimesheetStatus): boolean => {
    return status === TimesheetStatus.Draft;
  };


  const formatTimeDisplay = (decimalHours?: number): string => {
    if (!decimalHours || decimalHours === 0) return '-';
    
    
    const roundedHours = Math.round(decimalHours * 100) / 100;
    
    const hours = Math.floor(roundedHours);
    const minutes = Math.round((roundedHours - hours) * 60);
    
   
    if (minutes >= 60) {
      return `${(hours + 1).toString().padStart(2, '0')}`;
    }
    
    
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${formattedHours}.${formattedMinutes}`;
  };

  return (
    <Table size="small">
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
            <TableCell>{row.projectName}</TableCell>
            <TableCell>{row.tasks}</TableCell>
            <TableCell>{formatTimeDisplay(row.plannedHours)}</TableCell>
            <TableCell>{formatTimeDisplay(row.hoursSpent)}</TableCell>
            <TableCell>{row.billableType}</TableCell>
            <TableCell>
              <Chip size="small" label={row.status} color={statusColor(row.status) as any} />
            </TableCell>
            <TableCell align="right">
              <IconButton 
                size="small" 
                aria-label="edit"
                disabled={!canEditTimesheet(row.status)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                aria-label="delete" 
                sx={{ ml: 1 }}
                disabled={!canEditTimesheet(row.status)}
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}



