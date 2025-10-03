export interface ITimesheetActionButtonsProps {
  onSubmit: () => void;
  onSaveAsDraft: () => void;
  onSelectWork: () => void;
  isSubmitDisabled: boolean;
  isSaveDisabled: boolean;
  isSelectWorkDisabled: boolean;
  isActivityPopupOpen: boolean;
  onCloseActivityPopup: () => void;
  onActivitySuccess: (customActivity?: string | null) => void;
}