import type { IEmployeeProps } from '../../entity/IEmployeeProps';

export interface IStaffSearchSectionProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  availableStaff: IEmployeeProps[];
  selectedStaff: IEmployeeProps[];
  onStaffToggle: (staff: IEmployeeProps) => void;
  staffType: 'employees' | 'members';
}