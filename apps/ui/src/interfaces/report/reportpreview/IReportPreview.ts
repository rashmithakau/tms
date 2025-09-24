import React from 'react';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
}

type InputColumn<T> =
  | DataTableColumn<T>
  | {
      key: string;
      header: string;
      render?: (row: T) => React.ReactNode;
      label?: never;
    };

export interface ReportPreviewTableProps<T = any> {
  columns: InputColumn<T>[];
  rows: T[];
  title?: string;
  getRowKey?: (row: T) => string | number;
}
