export interface IApprovalActionButtonsProps {
  isSelectionMode: boolean;
  selectedDaysCount: number;
  selectedIdsCount: number;
  pendingIdsCount: number;
  onToggleSelectionMode: () => void;
  onApproveDays: () => void;
  onRejectDays: () => void;
  onApproveWeeks: () => void;
  onRejectWeeks: () => void;
}