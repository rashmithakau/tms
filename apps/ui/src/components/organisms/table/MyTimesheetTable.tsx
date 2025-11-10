import React, { useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StatusChip from '../../atoms/common/button/StatusChip';
import ActionButtons from '../../molecules/common/other/ActionButtons';
import AddTimesheetRow, { NewTimesheetEntry } from '../../molecules/timesheet/AddTimesheetRow';
import { TimesheetStatus } from '@tms/shared';
import { DailyTimesheetEntry } from '../../../api/dailyTimesheet';
import { useMyProjects } from '../../../hooks/project/useMyProjects';

interface MyTimesheetTableProps {
  rows: DailyTimesheetEntry[];
  onEdit?: (row: DailyTimesheetEntry) => void;
  onDelete?: (row: DailyTimesheetEntry) => void;
  onAddNew?: (entry: NewTimesheetEntry) => Promise<void>;
  showActions?: boolean;
}

const MyTimesheetTable: React.FC<MyTimesheetTableProps> = ({
  rows,
  onEdit,
  onDelete,
  onAddNew,
  showActions = true,
}) => {
  const [showAddRow, setShowAddRow] = useState(false);
  const { projects, isLoading: projectsLoading } = useMyProjects();
  
  const canEditTimesheet = (status: TimesheetStatus): boolean => {
    return status === TimesheetStatus.Draft;
  };

  const formatTimeDisplay = (decimalHours?: number): string => {
    if (!decimalHours || decimalHours === 0) return '-';
    
    const roundedHours = Math.round(decimalHours * 100) / 100;
    const hours = Math.floor(roundedHours);
    const minutes = Math.round((roundedHours - hours) * 60);
    
    if (minutes >= 60) {
      return `${(hours + 1).toString().padStart(2, '0')}:00`;
    }
    
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes}`;
  };

  const handleSaveNew = async (entry: NewTimesheetEntry) => {
    if (onAddNew) {
      await onAddNew(entry);
      setShowAddRow(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddRow(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowAddRow(true)}
          disabled={showAddRow || projectsLoading}
        >
          Add New Entry
        </Button>
      </Box>
      
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Project/Team</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tasks</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Hours Worked</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Billable/Non-Billable</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              {showActions && <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {showAddRow && (
              <AddTimesheetRow
                projects={projects}
                onSave={handleSaveNew}
                onCancel={handleCancelAdd}
              />
            )}
            {rows.length === 0 && !showAddRow ? (
              <TableRow>
                <TableCell colSpan={showActions ? 8 : 7} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">No timesheets found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row._id} hover>
                  <TableCell>
                    {new Date(row.date || new Date()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>{row.projectName || row.teamName || '-'}</TableCell>
                  <TableCell>{row.taskTitle || '-'}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={row.description || ''}
                    >
                      {row.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatTimeDisplay(row.hoursSpent)}</TableCell>
                  <TableCell>{row.billableType || '-'}</TableCell>
                  <TableCell>
                    <StatusChip status={row.status || TimesheetStatus.Draft} />
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <ActionButtons
                        onEdit={() => onEdit && onEdit(row)}
                        onDelete={() => onDelete && onDelete(row)}
                        disabled={!canEditTimesheet(row.status || TimesheetStatus.Draft)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default MyTimesheetTable;
