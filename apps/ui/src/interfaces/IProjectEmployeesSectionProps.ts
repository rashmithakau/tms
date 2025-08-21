import { IEmployeeProps } from './IEmployeeProps';

export interface IProjectEmployeesSectionProps {
  selectedEmployees: IEmployeeProps[];
  onAddEmployeesClick: () => void;
  onRemoveEmployee: (employeeId: string) => void;
  title?: string;
  emptyMessage?: string;
  height?: string | number;
}
