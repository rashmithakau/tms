import { IEmployeeProps } from '../../entity/IEmployeeProps';

export interface ISupervisorSelectProps {
  employees: IEmployeeProps[];
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}