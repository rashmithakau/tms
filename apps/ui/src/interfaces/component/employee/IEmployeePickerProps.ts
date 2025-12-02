import type { IEmployeeProps } from '../../entity/IEmployeeProps';

export interface EmployeePickerProps {
  users: IEmployeeProps[];
  selected: IEmployeeProps[];
  onToggle: (employee: IEmployeeProps) => void;
  onRemove: (employeeId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}