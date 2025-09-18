import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  submitMyDraftTimesheets,
  createMyTimesheet,
  updateMyTimesheet,
} from '../../api/timesheet';
import { useToast } from '../../contexts/ToastContext';

export const useTimesheetSubmission = (refresh: () => Promise<void>) => {
  const timesheetData = useSelector((state: any) => state.timesheet);
  const toast = useToast();
  const [isActivityPopupOpen, setActivityPopupOpen] = useState(false);


  const calculateTotalHours = () => {
    if (
      !timesheetData.timesheetData ||
      timesheetData.timesheetData.length === 0
    ) {
      return 0;
    }

    return timesheetData.timesheetData
      .flatMap((cat: any) => cat.items)
      .reduce(
        (sum: number, row: any) =>
          sum +
          row.hours.reduce(
            (s: number, h: string) => s + parseFloat(h || '0'),
            0
          ),
        0
      );
  };

  const totalHours = calculateTotalHours();
  const isUnderMinimumHours = totalHours < 40.0;

  const handleActivityOpenPopup = () => {
    setActivityPopupOpen(true);
  };

  const handleActivityClosePopup = () => {
    setActivityPopupOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const currentId = timesheetData.currentTimesheetId;
      const currentStatus = timesheetData.status;
      
      if (!currentId) {
        toast.error('No timesheet for this week');
        return;
      }
      
      if (!['Draft', 'Rejected'].includes(currentStatus || '')) {
        toast.error('Only draft and rejected timesheets can be submitted');
        return;
      }
      
      if (isUnderMinimumHours) {
        toast.error(
          `Minimum 40 hours required. Current total: ${totalHours.toFixed(2)} hours`
        );
        return;
      }
      
      if (currentStatus === 'Rejected') {
        await updateMyTimesheet(currentId, {
          data: timesheetData.timesheetData,
        });
      }
      
      await submitMyDraftTimesheets([currentId]);
      toast.success('Timesheet submitted for approval');
      await refresh();
    } catch (e) {
      toast.error('Failed to submit timesheet');
    }
  };

  
  const handleSaveAsDraft = async () => {
    try {
      const payload = {
        weekStartDate: timesheetData.weekStartDate,
        data: timesheetData.timesheetData,
      };

      if (timesheetData.currentTimesheetId) {
        await updateMyTimesheet(timesheetData.currentTimesheetId, {
          data: payload.data,
        });
        toast.success('Timesheet saved');
      } else {
        await createMyTimesheet(payload);
        toast.success('Timesheet created');
      }
      
      await refresh();
    } catch (e: any) {
      console.error('Save error:', e);

      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to save timesheet';
      toast.error(errorMessage);
    }
  };

  const isDataSavedInDB = JSON.stringify(timesheetData.timesheetData) === (timesheetData.originalDataHash || '');
  

  const isSubmitDisabled = !['Draft', 'Rejected'].includes(timesheetData.status || '') || 
    isUnderMinimumHours || 
    (timesheetData.status === 'Draft' && !isDataSavedInDB);
    
  
  const isSaveDisabled = timesheetData.status === 'Rejected' || 
    !['Draft'].includes(timesheetData.status || '') ||
    isDataSavedInDB;
    
  const isSelectWorkDisabled = !['Draft', 'Rejected'].includes(timesheetData.status || '');

  return {
    totalHours,
    isUnderMinimumHours,
    isActivityPopupOpen,
    handleActivityOpenPopup,
    handleActivityClosePopup,
    handleSubmit,
    handleSaveAsDraft,
    isSubmitDisabled,
    isSaveDisabled,
    isSelectWorkDisabled,
  };
};