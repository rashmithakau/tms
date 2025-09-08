import React from 'react';
import { Box } from '@mui/material';
import BaseBtn from '../atoms/buttons/BaseBtn';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import { TimesheetStatus } from '@tms/shared';

interface ApprovalActionButtonsProps {
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

const ApprovalActionButtons: React.FC<ApprovalActionButtonsProps> = ({
  isSelectionMode,
  selectedDaysCount,
  selectedIdsCount,
  pendingIdsCount,
  onToggleSelectionMode,
  onApproveDays,
  onRejectDays,
  onApproveWeeks,
  onRejectWeeks,
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
      {/* Selection Mode Toggle */}
      <BaseBtn
        variant="text"
        onClick={onToggleSelectionMode}
        startIcon={<ChecklistOutlinedIcon />}
      >
        {isSelectionMode ? 'Exit Selection' : 'Select Days'}
      </BaseBtn>

      {/* Day-based approval buttons */}
      {isSelectionMode && (
        <>
          <BaseBtn
            variant="text"
            disabled={selectedDaysCount === 0}
            onClick={onApproveDays}
            startIcon={<ThumbUpAltOutlinedIcon />}
          >
            Approve selected
          </BaseBtn>

          <BaseBtn
            variant="text"
            disabled={selectedDaysCount === 0}
            onClick={onRejectDays}
            startIcon={<ThumbDownAltOutlinedIcon />}
          >
            Reject selected
          </BaseBtn>
        </>
      )}

      {/* Week-based approval buttons */}
      {!isSelectionMode && (
        <>
          <BaseBtn
            variant="text"
            disabled={pendingIdsCount === 0 || selectedIdsCount === 0}
            onClick={onApproveWeeks}
            startIcon={<ThumbUpAltOutlinedIcon />}
          >
            Approve selected
          </BaseBtn>

          <BaseBtn
            variant="text"
            disabled={pendingIdsCount === 0 || selectedIdsCount === 0}
            onClick={onRejectWeeks}
            startIcon={<ThumbDownAltOutlinedIcon />}
          >
            Reject selected
          </BaseBtn>
        </>
      )}
    </Box>
  );
};

export default ApprovalActionButtons;