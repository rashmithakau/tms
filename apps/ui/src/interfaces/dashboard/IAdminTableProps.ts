import React from 'react';

export interface ITableColumn {
  field: string;
  headerName: string;
  width?: number;
  renderCell?: (params: { value: any; row: any }) => React.ReactNode;
}

export interface IAdminTableProps {
  rows: any[];
  columns: ITableColumn[];
  title: string;
  loading?: boolean;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onAdd?: () => void;
  showActions?: boolean;
}
