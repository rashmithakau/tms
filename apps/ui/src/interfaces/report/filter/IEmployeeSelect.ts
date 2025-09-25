export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface EmployeeSelectProps {
  employees: Employee[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}