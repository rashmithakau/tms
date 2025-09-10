import { useState } from 'react';
import { Box } from '@mui/material';
import PageLoading from '../molecules/PageLoading';
import TableWindowLayout from '../templates/TableWindowLayout';
import { useTimesheets } from '../../hooks/useTimesheets';
import { deleteMyTimesheet } from '../../api/timesheet';
import ConfirmDialog from '../molecules/ConfirmDialog';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useToast } from '../contexts/ToastContext';
import TimeSheetTableCalander from './TimeSheetTableCalander';
import WeekNavigator from '../atoms/WeekNavigator';
import TimesheetActionButtons from '../molecules/TimesheetActionButtons';
import { useTimesheetWeekNavigation } from '../../hooks/useTimesheetWeekNavigation';
import { useTimesheetSubmission } from '../../hooks/useTimesheetSubmission';

const MyTimesheetsWindow: React.FC = () => {
  const { rows, isLoading, refresh } = useTimesheets();
  const toast = useToast();
  
  // Use custom hooks for week navigation and submission logic
  const { handleNextWeek, handlePreviousWeek, getFormattedWeekRange } = useTimesheetWeekNavigation();
  const {
    isActivityPopupOpen,
    handleActivityOpenPopup,
    handleActivityClosePopup,
    handleSubmit,
    handleSaveAsDraft,
    isSubmitDisabled,
    isSaveDisabled,
    isSelectWorkDisabled,
  } = useTimesheetSubmission(refresh);

  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });

  const { startDate, endDate } = getFormattedWeekRange();

  return (
    <Box sx={{ padding: 2, height: '93%' }}>
      {isLoading ? (
        <PageLoading variant="inline" message="Loading my timesheets..." />
      ) : (
        <TableWindowLayout
          title="My Time Sheets"
          buttons={[
            <Box
              key="controls"
              sx={{
                mt: 2,
                ml: 2,
                display: 'flex',
                flexDirection: 'row',
                gap: { xs: 2, sm: 4, md: 6 },
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <WeekNavigator
                startDate={startDate}
                endDate={endDate}
                onPreviousWeek={handlePreviousWeek}
                onNextWeek={handleNextWeek}
              />
              
              <TimesheetActionButtons
                onSubmit={handleSubmit}
                onSaveAsDraft={handleSaveAsDraft}
                onSelectWork={handleActivityOpenPopup}
                isSubmitDisabled={isSubmitDisabled}
                isSaveDisabled={isSaveDisabled}
                isSelectWorkDisabled={isSelectWorkDisabled}
                isActivityPopupOpen={isActivityPopupOpen}
                onCloseActivityPopup={handleActivityClosePopup}
              />
            </Box>,
          ]}
          table={<TimeSheetTableCalander />}
        />
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Delete timesheet"
        message="Are you sure you want to delete this timesheet? This action cannot be undone."
        icon={<DeleteRoundedIcon />}
        iconColor="error.main"
        confirmButtonColor="error"
        confirmText="Delete"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={async () => {
          if (confirm.id) {
            try {
              await deleteMyTimesheet(confirm.id);
              toast.success('Timesheet deleted');
              await refresh();
            } catch (e) {
              toast.error('Failed to delete timesheet');
            }
          }
          setConfirm({ open: false });
        }}
      />
    </Box>
  );
};

export default MyTimesheetsWindow;
