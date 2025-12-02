import React from 'react';
import { Box } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import BaseBtn from '../../atoms/common/button/BaseBtn';
import { useDispatch } from 'react-redux';
import { select_btn } from '../../../store/slices/empMenuNavSclice';
import { EmpMenuItem, UserRole } from '@tms/shared';
import { useAuth } from '../../../contexts/AuthContext';
import { IEmpMenuProps } from '../../../interfaces/organisms/timesheet';
import AssessmentIcon from '@mui/icons-material/Assessment';
const EmpMenu: React.FC<IEmpMenuProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const { authState } = useAuth();
  const role = authState.user?.role;
  function handleMyTimesheetsClick(): void {
    dispatch(select_btn(EmpMenuItem.MyTimesheets));
    onClose();
  }
  function handleReviewTimesheetsClick(): void {
    dispatch(select_btn(EmpMenuItem.ReviewTimesheets));
    onClose();
  }
  function handleReportsClick(): void {
    dispatch(select_btn(EmpMenuItem.Reports));
    onClose();
  }

  return (
    <Box sx={{ p: 2, minWidth: 100 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <BaseBtn
          fullWidth
          variant="text"
          onClick={handleMyTimesheetsClick}
          startIcon={<AssignmentIcon />}
          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
        >
          My Timesheets
        </BaseBtn>

        {(role==UserRole.Supervisor || role==UserRole.SupervisorAdmin) && (
        <BaseBtn
        fullWidth
        variant="text"
        onClick={handleReviewTimesheetsClick}
        startIcon={<RateReviewIcon />}
        sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
      >
        Review Timesheets
      </BaseBtn>
        )}
{(role==UserRole.Supervisor || role==UserRole.SupervisorAdmin) && (
<BaseBtn
        fullWidth
        variant="text"
        onClick={handleReportsClick}
        startIcon={<AssessmentIcon />}
        sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
      >
        Reports
      </BaseBtn>
)}

      </Box>
    </Box>
  );
};

export default EmpMenu;
