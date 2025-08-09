import React from 'react';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { IDialogActionsProps } from '../../interfaces/IDialogActionsProps';

const DialogActions: React.FC<IDialogActionsProps> = ({
  onCancel,
  onSave,
  saveText,
  cancelText = "Cancel",
  saveDisabled = false,
  selectedCount = 0,
}) => {
  const defaultSaveText = `Add ${selectedCount} Employee${selectedCount !== 1 ? 's' : ''}`;
  
  return (
    <>
      <BaseBtn onClick={onCancel} variant="outlined">
        {cancelText}
      </BaseBtn>
      <BaseBtn
        onClick={onSave}
        variant="contained"
        disabled={saveDisabled}
      >
        {saveText || defaultSaveText}
      </BaseBtn>
    </>
  );
};

export default DialogActions;