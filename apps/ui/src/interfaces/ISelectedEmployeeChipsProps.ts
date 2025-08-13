import { IEmployeeProps } from "./IEmployeeProps";

export interface ISelectedEmployeeChipsProps {
  employees: IEmployeeProps[];
  onRemove: (employeeId: number) => void;
  title?: string;
  sx?: object;
}