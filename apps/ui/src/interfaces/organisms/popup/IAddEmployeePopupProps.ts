import { IEmployeeProps } from '../../entity/IEmployeeProps';
import { UserRole } from '@tms/shared';

export interface AddEmployeePopupProps {
  open: boolean;
  onClose: () => void;
  onSave: (selectedEmployees: IEmployeeProps[]) => void;
  initialSelectedEmployees?: IEmployeeProps[];
  roles?: UserRole[];
}