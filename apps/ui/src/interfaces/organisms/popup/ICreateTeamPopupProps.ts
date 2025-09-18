export interface CreateTeamFormData {
  teamName: string;
  supervisor: string;
}

export interface CreateTeamPopupProps {
  open: boolean;
  onClose: () => void;
}