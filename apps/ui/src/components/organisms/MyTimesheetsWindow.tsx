import {useState} from 'react';
import { Box, CircularProgress, IconButton } from '@mui/material';
import TableWindowLayout from '../templates/TableWindowLayout';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useTimesheets } from '../../hooks/useTimesheets';
import {
  deleteMyTimesheet,
  submitMyDraftTimesheets,
} from '../../api/timesheet';
import ConfirmDialog from '../molecules/ConfirmDialog';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { useToast } from '../contexts/ToastContext';
import TimeSheetTableCalander from './TimeSheetTableCalander';
import SelectActivityPopup from './SelectActivityPopup';
import SaveIcon from '@mui/icons-material/Save';
import { createMyTimesheet } from '../../api/timesheet';
import { useDispatch, useSelector } from 'react-redux';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getWeekRangeAndUpdateRedux } from '../../utils/getWeekRangeAndUpdateRedux';

const MyTimesheetsWindow: React.FC = () => {
  const timesheetData = useSelector((state: any) => state.timesheet);
  const payload = {
    weekStartDate: timesheetData.weekStartDate,
    data: timesheetData.timesheetData,
  };
  const [isActivityPopupOpen, setActivityPopupOpen] = useState(false);

  const handleActivityOpenPopup = () => {
    setActivityPopupOpen(true);
  };

  const handleActivityClosePopup = () => {
    setActivityPopupOpen(false);
  };
  const { rows, isLoading, refresh } = useTimesheets();
  const toast = useToast();

  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });

  const handleSubmit = async () => {

    try {
      await submitMyDraftTimesheets(["ids"]);
      toast.success('Draft timesheets submitted');
      await refresh();
    } catch (e) {
      toast.error('Failed to submit drafts');
    }
  };

  const dispatch = useDispatch();
  const currentWeekStartDate = useSelector((state: any) => state.timesheet.weekStartDate);

  const handleNextWeek = () => {
    getWeekRangeAndUpdateRedux(1, currentWeekStartDate, dispatch);
  };

  const handlePreviousWeek = () => {
    getWeekRangeAndUpdateRedux(-1, currentWeekStartDate, dispatch);
  };

  const handleSaveAsDraft=() => {
    console.log(payload);
    createMyTimesheet(payload);
    toast.success('Timesheet saved as draft');
  }

  return (
    <Box sx={{ padding: 2, height: '93%' }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableWindowLayout
          title="My Time Sheets"
          buttons={[
            <Box
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

              <IconButton onClick={handlePreviousWeek}>
                <ArrowBackIcon sx={{ color: (theme) => theme.palette.primary.main }}/>
              </IconButton>
              {new Date(timesheetData.weekStartDate).toLocaleDateString(
                'en-US',
                { weekday: 'short', month: 'short', day: '2-digit' }
              )}
              &nbsp;to&nbsp;
              {new Date(timesheetData.weekEndDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              })}
              <IconButton onClick={handleNextWeek}>
              <ArrowForwardIcon sx={{ color: (theme) => theme.palette.primary.main }} />
              </IconButton>
              <BaseBtn
                variant="text"
                disabled={false}
                onClick={handleSubmit}
                startIcon={<SendOutlinedIcon />}
              >
                Sign And Submit
              </BaseBtn>
              <BaseBtn
                onClick={handleSaveAsDraft}
                variant="text"
                startIcon={<SaveIcon />}
              >
                Save as Draft
              </BaseBtn>
              <BaseBtn
                onClick={handleActivityOpenPopup}
                variant="contained"
                startIcon={<AddOutlinedIcon />}
              >
                Select Work
              </BaseBtn>
              <SelectActivityPopup
                open={isActivityPopupOpen}
                onClose={handleActivityClosePopup}
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
