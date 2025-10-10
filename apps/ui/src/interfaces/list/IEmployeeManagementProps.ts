import { EmployeeRow } from '../component/table/ITableRowTypes';

export interface IEmployeeManagementProps {
  error?: string;
  isLoading: boolean;
  rows: EmployeeRow[];
  projectOptions: Array<{ id: string; name: string }>;
  selectedProjectIds: string[];
  onSelectedProjectIdsChange: (ids: string[]) => void;
  statusFilter: 'all' | 'Active' | 'Inactive';
  onStatusFilterChange: (filter: 'all' | 'Active' | 'Inactive') => void;
  roleFilter: 'all' | 'admin' | 'supervisorAdmin' | 'supervisor' | 'emp';
  onRoleFilterChange: (filter: 'all' | 'admin' | 'supervisorAdmin' | 'supervisor' | 'emp') => void;
  onAddEmployee: () => void;
  onEditEmployee?: (row: EmployeeRow) => void;
  onRefresh?: () => Promise<void>;
}