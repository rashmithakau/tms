import { IEmployeeProps } from './IEmployeeProps';

export interface IProjectEmployeesSectionProps {
  selectedEmployees: IEmployeeProps[];
  onAddEmployeesClick: () => void;
  onRemoveEmployee: (employeeId: number) => void;
  title?: string;
  addButtonText?: string;
  emptyMessage?: string;
  height?: string | number;
}
