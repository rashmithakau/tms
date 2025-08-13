import { IEmployeeProps } from "./IEmployeeProps";

export interface IEmployeeListProps {
  employees: IEmployeeProps[];
  selectedEmployees: IEmployeeProps[];
  onEmployeeToggle: (employee: IEmployeeProps) => void;
  title?: string;
  emptyMessage?: string;
  searchTerm?: string;
  maxHeight?: number | string;
}
