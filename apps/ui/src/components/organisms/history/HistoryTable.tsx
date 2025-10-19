import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Typography,
  Skeleton,
} from '@mui/material';
import { format } from 'date-fns';
import { HistoryRecord, HistoryActionType } from '../../../interfaces/api';

interface HistoryTableProps {
  rows: HistoryRecord[];
  loading?: boolean;
}

const getActionTypeColor = (actionType: HistoryActionType): 'success' | 'error' | 'warning' | 'info' | 'default' => {
  if (actionType.includes('CREATED') || actionType.includes('REACTIVATED') || actionType.includes('RESTORED') || actionType.includes('ADDED')) {
    return 'success';
  }
  if (actionType.includes('DELETED') || actionType.includes('DEACTIVATED') || actionType.includes('REMOVED')) {
    return 'error';
  }
  if (actionType.includes('UPDATED') || actionType.includes('CHANGED')) {
    return 'warning';
  }
  if (actionType.includes('ASSIGNED')) {
    return 'info';
  }
  return 'default';
};

const getActionTypeLabel = (actionType: HistoryActionType): string => {
  return actionType
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const HistoryTable: React.FC<HistoryTableProps> = ({
  rows,
  loading = false,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'hh:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <Paper elevation={1}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 400 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Performed By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(10)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    No history records found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row._id} hover>
                  <TableCell>{formatDate(row.timestamp)}</TableCell>
                  <TableCell>{formatTime(row.timestamp)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getActionTypeLabel(row.actionType)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {row.performedBy.firstName} {row.performedBy.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.performedBy.email}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default HistoryTable;
