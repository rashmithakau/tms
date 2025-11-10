import { useState } from 'react';
import { Box } from '@mui/material';
import PageLoading from '../../molecules/common/loading/PageLoading';
import TableWindowLayout from '../../templates/layout/TableWindowLayout';
import { useDailyTimesheets } from '../../../hooks/timesheet/useDailyTimesheets';
import { createDailyTimesheet, deleteDailyTimesheet } from '../../../api/dailyTimesheet';
import ConfirmDialog from '../../molecules/common/dialog/ConfirmDialog';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useToast } from '../../../contexts/ToastContext';
import TimeSheetTableCalander from './TimeSheetTableCalander';
import MyTimesheetTable from '../table/MyTimesheetTable';
import WeekNavigator from '../../atoms/common/navigation/WeekNavigator';
import TimesheetActionButtons from '../../molecules/timesheet/TimesheetActionButtons';
import { useTimesheetWeekNavigation } from '../../../hooks/navigation/useTimesheetWeekNavigation';
import { useTimesheetSubmission } from '../../../hooks/timesheet/useTimesheetSubmission';
import ViewToggle, { ViewMode } from '../../atoms/common/button/ViewToggle';
import { NewTimesheetEntry } from '../../molecules/timesheet/AddTimesheetRow';
import { DailyTimesheetEntry } from '../../../api/dailyTimesheet';

const MyTimesheetsWindow: React.FC = () => {
  const { rows, isLoading, refresh } = useDailyTimesheets();
  const toast = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('table'); // Default to table view for daily entries
  
  const { handleNextWeek, handlePreviousWeek, getFormattedWeekRange } = useTimesheetWeekNavigation();
  const {
    isActivityPopupOpen,
    handleActivityOpenPopup,
    handleActivityClosePopup,
    handleActivitySuccess,
    handleSubmit,
    handleSaveAsDraft,
    handleRequestEdit,
    isSubmitDisabled,
    isSaveDisabled,
    isSelectWorkDisabled,
    isRequestEditDisabled,
  } = useTimesheetSubmission(refresh);

  const [confirm, setConfirm] = useState<{ 
    open: boolean; 
    entry?: DailyTimesheetEntry;
  }>({ open: false });

  const { startDate, endDate } = getFormattedWeekRange();

  const handleEdit = (row: DailyTimesheetEntry) => {
    // Navigate to edit or open edit modal
    console.log('Edit timesheet:', row);
    toast.info('Edit functionality coming soon');
  };

  const handleDelete = (row: DailyTimesheetEntry) => {
    setConfirm({ open: true, entry: row });
  };

  const handleAddNew = async (entry: NewTimesheetEntry) => {
    try {
      await createDailyTimesheet({
        date: entry.date,
        projectId: entry.projectId,
        projectName: entry.projectName,
        taskTitle: entry.task || 'Task',
        description: entry.description,
        hoursSpent: entry.hoursSpent,
        billableType: entry.billableType,
      });
      
      toast.success('Timesheet entry added successfully');
      await refresh();
    } catch (error: any) {
      console.error('Error adding timesheet entry:', error);
      toast.error(error.response?.data?.message || 'Failed to add timesheet entry');
    }
  };

  return (
    <>
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
              {viewMode === 'calendar' && (
                <WeekNavigator
                  startDate={startDate}
                  endDate={endDate}
                  onPreviousWeek={handlePreviousWeek}
                  onNextWeek={handleNextWeek}
                />
              )}
              
              <ViewToggle view={viewMode} onChange={setViewMode} />
              
              {viewMode === 'calendar' && (
                <TimesheetActionButtons
                  onSubmit={handleSubmit}
                  onSaveAsDraft={handleSaveAsDraft}
                  onSelectWork={handleActivityOpenPopup}
                  onRequestEdit={handleRequestEdit}
                  isSubmitDisabled={isSubmitDisabled}
                  isSaveDisabled={isSaveDisabled}
                  isSelectWorkDisabled={isSelectWorkDisabled}
                  isRequestEditDisabled={isRequestEditDisabled}
                  isActivityPopupOpen={isActivityPopupOpen}
                  onCloseActivityPopup={handleActivityClosePopup}
                  onActivitySuccess={handleActivitySuccess}
                />
              )}
            </Box>,
          ]}
          table={
            viewMode === 'calendar' ? (
              <TimeSheetTableCalander />
            ) : (
              <MyTimesheetTable
                rows={rows}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddNew={handleAddNew}
                showActions={true}
              />
            )
          }
        />
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Delete timesheet entry"
        message="Are you sure you want to delete this timesheet entry? This action cannot be undone."
        icon={<DeleteRoundedIcon />}
        iconColor="error.main"
        confirmButtonColor="error"
        confirmText="Delete"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={async () => {
          const { entry } = confirm;
          if (entry && entry._id) {
            try {
              await deleteDailyTimesheet(entry._id);
              toast.success('Timesheet entry deleted');
              await refresh();
            } catch (e: any) {
              console.error('Delete error:', e);
              toast.error(e.response?.data?.message || 'Failed to delete timesheet entry');
            }
          }
          setConfirm({ open: false });
        }}
      />
    </>
  );
};

export default MyTimesheetsWindow;
