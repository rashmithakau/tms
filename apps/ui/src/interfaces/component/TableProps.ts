import React from 'react';

// Table component interfaces
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

export interface TimeSheetTableProps {
  selectedEmployees: string[];
  setSelectedEmployees: React.Dispatch<React.SetStateAction<string[]>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  users: any[];
  weekStartDate: string;
  weekEndDate: string;
  onEmployeeSelect: (employeeId: string) => void;
}

export interface ProjectTableProps {
  searchTerm: string;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
}
