export interface CreateProjectFormData {
  projectName: string;
  billable: 'yes' | 'no';
  supervisor: string | null;
}

export interface CreateProjectPopupProps {
  open: boolean;
  onClose: () => void;
}