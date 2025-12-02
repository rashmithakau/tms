import React from 'react';
import { TableRow, TableCell, Checkbox, Chip } from '@mui/material';
import { TimesheetStatus } from '@tms/shared';
import { ITimesheetSelectionRowProps } from '../../../interfaces/component/timesheet';

const TimesheetSelectionRow: React.FC<ITimesheetSelectionRowProps> = ({
  timesheet,
  isSelected,
  isPending,
  onSelectionChange,
}) => {
  const getStatusColor = (status: TimesheetStatus) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <TableRow>
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          onChange={(e) => onSelectionChange(timesheet._id, e.target.checked)}
          disabled={timesheet.status !== TimesheetStatus.Pending}
          color="primary"
        />
      </TableCell>
      <TableCell>{formatDate(timesheet.date)}</TableCell>
      <TableCell>
        <Chip
          label={timesheet.status}
          color={getStatusColor(timesheet.status)}
          size="small"
        />
      </TableCell>
      <TableCell>{timesheet.hoursSpent?.toFixed(2) || '0.00'} hours</TableCell>
    </TableRow>
  );
};

export default TimesheetSelectionRow;