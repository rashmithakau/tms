import React from 'react';


export interface DataTableColumn<T> {
  label: string;
  render: (row: T) => React.ReactNode;
  key: string;
  width?: string | number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
}

export * from './table/ITableComponentProps';
