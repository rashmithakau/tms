export interface IEmpTableToolbarProps {
  projectsOptions: Array<{ id: string; name: string }>;
  selectedProjectIds: string[];
  onSelectedProjectIdsChange: (val: string[]) => void;
  statusFilter: 'all' | 'Active' | 'Inactive';
  onStatusFilterChange: (val: 'all' | 'Active' | 'Inactive') => void;
  roleFilter: 'all' | 'admin' | 'supervisorAdmin' | 'supervisor' | 'emp';
  onRoleFilterChange: (val: 'all' | 'admin' | 'supervisorAdmin' | 'supervisor' | 'emp') => void;
  availableRoles?: Array<{ value: string; label: string }>;
}