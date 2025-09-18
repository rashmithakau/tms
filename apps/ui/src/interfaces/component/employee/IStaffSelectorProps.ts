import type { IEmployeeProps } from '../../entity/IEmployeeProps';

export interface IStaffSelectorProps {
  selectedEmployees: IEmployeeProps[];
  availableEmployees: IEmployeeProps[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEmployeeToggle: (employee: IEmployeeProps) => void;
  onRemoveEmployee: (employeeId: string) => void;
  title?: string;
  searchPlaceholder?: string;
  searchLabel?: string;
}