
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from '@mui/material';
import {  DataTableProps } from '../../../interfaces';

function DataTable<T>({ columns, rows, getRowKey }: DataTableProps<T>) {
  return (
    <TableContainer sx={{ maxHeight: '70vh' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key}>{col.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => {
            const providedKey = getRowKey ? getRowKey(row) : undefined;
            const computedRowKey = providedKey ?? rowIndex;
            const rowKeyString = String(computedRowKey);
            return (
              <TableRow key={rowKeyString} hover>
                {columns.map((col) => (
                  <TableCell key={`${col.key}-${rowKeyString}`}>{col.render(row)}</TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;