import React, { useMemo } from 'react';
import { Box, CardHeader, Typography } from '@mui/material';
import DataTable from '../../../organisms/table/DataTable';
import {useTheme} from '@mui/material/styles';
import { ReportPreviewTableProps, DataTableColumn } from '../../../../interfaces/report/reportpreview/IReportPreview';

const ReportPreviewTable = <T extends { weekStartDate?: string } = any>({ columns, rows, title, getRowKey }: ReportPreviewTableProps<T>) => {
  type RowWithEnd = T & { weekEndDate?: string };
  // Helper to calculate week end date 
  const getWeekEndDate = (weekStartDate: string) => {
    try {
      const start = new Date(weekStartDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return end.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  // Add week end date to rows that have weekStartDate
  const enrichedRows: RowWithEnd[] = useMemo(
    () =>
      rows.map((row) => ({
        ...(row as T),
        weekEndDate: row.weekStartDate ? getWeekEndDate(row.weekStartDate) : '',
      })),
    [rows]
  );

  // Sort by weekStartDate ascending 
  const sortedRows: RowWithEnd[] = useMemo(() => [...enrichedRows].sort((a, b) => {
    const aTime = a.weekStartDate ? new Date(a.weekStartDate).getTime() : 0;
    const bTime = b.weekStartDate ? new Date(b.weekStartDate).getTime() : 0;
    return aTime - bTime;
  }), [enrichedRows]);

  // Normalize 
  const normalizedBaseColumns: DataTableColumn<RowWithEnd>[] = useMemo(() =>
    columns.map((col) => {
      const label = (col as any).label ?? (col as any).header ?? (col as any).key;
      const renderFn = (col as any).render ?? ((row: any) => (row ?? {})[(col as any).key] ?? '');
      return {
        key: (col as any).key,
        label,
        render: (row: RowWithEnd) => renderFn(row),
      } as DataTableColumn<RowWithEnd>;
    }),
  [columns]);

  // Add week end column if weekStartDate exists in any row
  const hasWeekStart = rows.some(row => row.weekStartDate);
  const enrichedColumns: DataTableColumn<RowWithEnd>[] = useMemo(() =>
    hasWeekStart
      ? normalizedBaseColumns
          .map((col) =>
            col.key === 'weekStartDate'
              ? [
                  col,
                  {
                    key: 'weekEndDate',
                    label: 'Week End',
                    render: (row: RowWithEnd) => row.weekEndDate || '',
                  } as DataTableColumn<RowWithEnd>,
                ]
              : [col]
          )
          .flat()
      : normalizedBaseColumns,
    [normalizedBaseColumns, hasWeekStart]
  );
  const theme = useTheme();
  return (
    <Box>
      {title && (
        <CardHeader sx={{ mb: 1, color: theme.palette.primary.main }} title={title} />
      )}
      {rows.length === 0 ? (
        <Box sx={{ py: 2 }}>
          <Typography sx={{ color: theme.palette.text.secondary }}>No data for current filters</Typography>
        </Box>
      ) : (
        <DataTable<RowWithEnd>
          columns={enrichedColumns}
          rows={sortedRows}
          getRowKey={(getRowKey as ((row: RowWithEnd) => string | number)) || ((_: RowWithEnd, idx: number) => idx)}
        />
      )}
    </Box>
  );
};

export default ReportPreviewTable;


