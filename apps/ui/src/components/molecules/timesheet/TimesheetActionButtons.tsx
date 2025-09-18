import React from 'react';
import { Box } from '@mui/material';
import BaseBtn from '../../atoms/button/BaseBtn';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SaveIcon from '@mui/icons-material/Save';
import SelectActivityPopup from '../../organisms/popup/SelectActivityPopup';
import { ITimesheetActionButtonsProps } from '../../../interfaces/component/timesheet';

const TimesheetActionButtons: React.FC<ITimesheetActionButtonsProps> = ({
  onSubmit,
  onSaveAsDraft,
  onSelectWork,
  isSubmitDisabled,
  isSaveDisabled,
  isSelectWorkDisabled,
  isActivityPopupOpen,
  onCloseActivityPopup,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <BaseBtn
        variant="text"
        disabled={isSubmitDisabled}
        onClick={onSubmit}
        startIcon={<SendOutlinedIcon />}
      >
        Sign And Submit
      </BaseBtn>
      
      <BaseBtn
        onClick={onSaveAsDraft}
        variant="text"
        startIcon={<SaveIcon />}
        disabled={isSaveDisabled}
      >
        Save as Draft
      </BaseBtn>
      
      <BaseBtn
        onClick={onSelectWork}
        variant="contained"
        startIcon={<AddOutlinedIcon />}
        disabled={isSelectWorkDisabled}
      >
        Select Work
      </BaseBtn>
      
      <SelectActivityPopup
        open={isActivityPopupOpen}
        onClose={onCloseActivityPopup}
      />
    </Box>
  );
};

export default TimesheetActionButtons;