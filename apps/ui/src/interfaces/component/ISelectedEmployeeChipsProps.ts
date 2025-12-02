import { IEmployeeProps } from "../entity/IEmployeeProps";

export interface ISelectedEmployeeChipsProps {
  employees: IEmployeeProps[];
 onRemove: (employeeId: string) => void;
  title?: string;
  sx?: object;
}