import React from 'react';
import { EmployeeRow, ProjectRow } from './ITableRowTypes';
import { ITimeSheetRow as TimesheetApiRow } from '../../entity/ITimeSheetRow';
import { TimesheetStatus } from '@tms/shared';

export interface EmpTableProps {
  rows: EmployeeRow[];
  onRefresh?: () => Promise<void>;
  onEditRow?: (row: EmployeeRow) => void;
}
 
export interface ProjectTableProps {
  rows: ProjectRow[];
  onRefresh?: () => Promise<void> | void;
  billableFilter?: 'all' | 'Yes' | 'No';
}

export interface TimeSheetTableProps {
  rows: TimesheetApiRow[];
  onEdit?: (row: TimesheetApiRow) => void;
  onDelete?: (row: TimesheetApiRow) => void;
  selectableStatus?: TimesheetStatus[];
  selectedIds?: string[];
  onToggleOne?: (id: string, checked: boolean) => void;
  onToggleAll?: (checked: boolean, ids: string[]) => void;
  showActions?: boolean;
  showEmployee?: boolean;
  onEmployeeClick?: (row: TimesheetApiRow) => void;
}


export interface LegacyTimeSheetTableProps {
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

export interface LegacyProjectTableProps {
  searchTerm: string;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
}