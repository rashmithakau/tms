export interface EmployeeRow {
  id?: string;
  employee_id?: string;
  email: string;
  firstName: string;
  lastName: string;
  team?: string;
  status: 'Active' | 'Inactive' | string;
  contactNumber: string;
  designation?: string;
  createdAt?: string;
}

export interface ProjectRow {
  id: string;
  projectName: string;
  billable: 'Yes' | 'No';
  createdAt?: string;
  employees?: { id: string; name: string; designation?: string; email?: string }[];
  supervisor?: { id: string; name: string; designation?: string; email?: string } | null;
}

export interface TeamRow {
  id: string;
  teamName: string;
  createdAt?: string;
  members: { id: string; name: string; designation?: string; email?: string }[];
  supervisor: { id: string; name: string; designation?: string; email?: string } | null;
}