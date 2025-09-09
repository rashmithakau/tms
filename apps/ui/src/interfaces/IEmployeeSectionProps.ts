import { IEmployeeProps } from './IEmployeeProps';

export interface IEmployeeSectionProps {
  selectedEmployees: IEmployeeProps[];
  onAddEmployeesClick: () => void;
  onRemoveEmployee: (employeeId: string) => void;
  title?: string;
  emptyMessage?: string;
  height?: string | number;
}


