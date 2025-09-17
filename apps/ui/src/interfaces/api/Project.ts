export interface ProjectListItem {
  _id: string;
  projectName: string;
  billable: boolean;
  employees: { _id: string; firstName: string; lastName: string; email: string; designation?: string }[];
  supervisor?: { _id: string; firstName: string; lastName: string; email: string; designation?: string } | null;
  createdAt?: string;
  status?: boolean;
}

export interface CreateProjectPayload {
  projectName: string;
  billable: 'yes' | 'no';
  employees: string[];
  supervisor?: string | null;
}
