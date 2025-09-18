import React from 'react';


export interface DataTableColumn<T> {
  label: string;
  render: (row: T) => React.ReactNode;
  key: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
}

export * from './table/ITableComponentProps';
