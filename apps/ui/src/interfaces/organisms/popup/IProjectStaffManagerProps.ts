export interface ProjectStaffManagerProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  initialEmployees: { id: string; name: string; designation?: string }[];
  initialSupervisor: { id: string; name: string; designation?: string } | null;
  onSaved?: () => void;
}