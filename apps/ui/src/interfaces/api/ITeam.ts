export interface CreateTeamPayload {
  teamName: string;
  employees: string[];
  supervisor: string | null;
  isDepartment?: boolean;
}

export interface TeamListItem {
  _id: string;
  teamName: string;
  createdAt: string;
  members: Array<{ _id: string; firstName: string; lastName: string; email?: string; designation?: string }>;
  supervisor: { _id: string; firstName: string; lastName: string; email?: string; designation?: string } | null;
  isDepartment?: boolean;
}
