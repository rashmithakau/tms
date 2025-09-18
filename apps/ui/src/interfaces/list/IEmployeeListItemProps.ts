import { IEmployeeProps } from "../../interfaces/entity/IEmployeeProps";

export interface IEmployeeListItemProps {
  employee: IEmployeeProps;
  isSelected: boolean;
  onToggle: (employee: IEmployeeProps) => void;
}