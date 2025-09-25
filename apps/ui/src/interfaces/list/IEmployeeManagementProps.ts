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
  onAddEmployee: () => void;
  onEditEmployee?: (row: EmployeeRow) => void;
}