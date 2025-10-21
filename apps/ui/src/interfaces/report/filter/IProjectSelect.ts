export interface ProjectSelectProps {
  projects: ProjectOption[];
  selectedProjectIds: string[];
  onChange: (projectIds: string[]) => void;
  disabled?: boolean;
}

export interface ProjectOption {
  _id: string;
  projectName: string;
  employees: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  supervisor?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    designation?: string;
  } | null;
}

