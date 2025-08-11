import { IEmployeeProps } from './IEmployeeProps';

export interface IAddEmployeePopupProps {
  open: boolean;
  onClose: () => void;
  onSave: (selectedEmployees: IEmployeeProps[]) => void;
  initialSelectedEmployees?: IEmployeeProps[];
}