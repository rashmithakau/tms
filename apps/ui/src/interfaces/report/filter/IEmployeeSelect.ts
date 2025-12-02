export interface ReportEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface EmployeeSelectProps {
  employees: ReportEmployee[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}