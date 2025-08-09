import { IEmployeeProps } from "./IEmployeeProps";

export interface IEmployeeListItemProps {
  employee: IEmployeeProps;
  isSelected: boolean;
  onToggle: (employee: IEmployeeProps) => void;
}