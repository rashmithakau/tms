import { IEmployeeProps } from "./IEmployeeProps";

export interface ISelectedEmployeeChipsProps {
  employees: IEmployeeProps[];
 onRemove: (employeeId: string) => void;
  title?: string;
  sx?: object;
}