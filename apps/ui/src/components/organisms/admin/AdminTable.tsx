import React from 'react';
import {
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Skeleton
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { AdminToolbar } from '../../molecules/dashboard';
import { StatusBadge } from '../../atoms/dashboard';
import { IAdminTableProps } from '../../../interfaces/dashboard';

const AdminTable: React.FC<IAdminTableProps> = ({
  rows,
  columns,
  title,
  loading = false,
  onEdit,
  onDelete,
  onAdd,
  showActions = true
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toolbarActions = React.useMemo(() => {
    const actions = [];
    
    if (onAdd) {
      actions.push({
        label: 'Add New',
        icon: <Visibility />,
        onClick: onAdd,
        variant: 'contained' as const,
        color: 'primary' as const
      });
    }

    return actions;
  }, [onAdd]);

  const renderCellValue = (row: any, column: any) => {
    const value = row[column.field];
    
    if (column.field === 'status' && !column.renderCell) {
      return <StatusBadge status={value} />;
    }
    
    if (column.renderCell) {
      return column.renderCell({ value, row });
    }
    
    return value;
  };

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ width: '100%', mb: 2, border: '1px solid', borderColor: 'divider' }}>
      <AdminToolbar
        title={title}
        actions={toolbarActions}
        onRefresh={() => window.location.reload()}
      />
      
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: 'grey.50' }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.field} sx={{ fontWeight: 'bold' }}>
                  {column.headerName}
                </TableCell>
              ))}
              {showActions && (onEdit || onDelete) && (
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(rowsPerPage)).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.field}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                  {showActions && (onEdit || onDelete) && (
                    <TableCell>
                      <Skeleton variant="text" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              paginatedRows.map((row) => (
                <TableRow key={row.id} hover>
                  {columns.map((column) => (
                    <TableCell key={column.field}>
                      {renderCellValue(row, column)}
                    </TableCell>
                  ))}
                  {showActions && (onEdit || onDelete) && (
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {onEdit && (
                          <IconButton
                            size="small"
                            onClick={() => onEdit(row.id)}
                            color="primary"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton
                            size="small"
                            onClick={() => onDelete(row.id)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default AdminTable;
