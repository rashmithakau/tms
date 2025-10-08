export interface ITimesheetActionButtonsProps {
  onSubmit: () => void;
  onSaveAsDraft: () => void;
  onSelectWork: () => void;
  onRequestEdit?: () => void;
  isSubmitDisabled: boolean;
  isSaveDisabled: boolean;
  isSelectWorkDisabled: boolean;
  isRequestEditDisabled?: boolean;
  isActivityPopupOpen: boolean;
  onCloseActivityPopup: () => void;
  onActivitySuccess: (customActivity?: string | null) => void;
}