export interface IDialogActionsProps {
  onCancel: () => void;
  onSave: () => void;
  saveText?: string;
  cancelText?: string;
  saveDisabled?: boolean;
  selectedCount?: number;
}
