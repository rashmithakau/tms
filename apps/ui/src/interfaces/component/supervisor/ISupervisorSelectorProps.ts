import { IEmployeeProps } from '../../entity/IEmployeeProps';

export interface ISupervisorSelectorProps {
  selectedEmployees: IEmployeeProps[];
  supervisor: string;
  onSupervisorChange: (supervisor: string) => void;
  caption?: string;
}