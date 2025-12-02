import React from 'react';

export interface ReportDataTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  width?: string | number;
}

type InputColumn<T> =
  | ReportDataTableColumn<T>
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
  subtitle?: string;
  subtitle2?: string;
  getRowKey?: (row: T) => string | number;
}
