export interface CreateTeamFormData {
  teamName: string;
  supervisor: string;
  isDepartment: boolean;
}

export interface CreateTeamPopupProps {
  open: boolean;
  onClose: () => void;
}