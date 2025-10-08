import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  submitMyDraftTimesheets,
  createMyTimesheet,
  updateMyTimesheet,
  requestTimesheetEdit,
} from '../../api/timesheet';
import { useToast } from '../../contexts/ToastContext';
import { TimesheetStatus } from '@tms/shared';
import { setTimesheetData } from '../../store/slices/timesheetSlice';

export const useTimesheetSubmission = (refresh: () => Promise<void>) => {
  const timesheetData = useSelector((state: any) => state.timesheet);
  const dispatch = useDispatch();
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

  const handleActivitySuccess = (customActivity?: string | null) => {
    // If a custom activity was provided, add it to the Absence category for this week only
    if (customActivity) {
      console.log('Adding custom activity:', customActivity);
      console.log('Current timesheet data:', timesheetData.timesheetData);
      
      const currentData = [...timesheetData.timesheetData];
      const absenceCatIndex = currentData.findIndex((c: any) => c.category === 'Absence');
      
      console.log('Absence category index:', absenceCatIndex);
      
      const newAbsenceItem = {
        work: customActivity,
        hours: Array(7).fill('00.00'),
        descriptions: Array(7).fill(''),
        dailyStatus: Array(7).fill(TimesheetStatus.Draft),
      };
      
      if (absenceCatIndex >= 0) {
        // Check if this custom activity already exists
        const exists = currentData[absenceCatIndex].items.some(
          (item: any) => item.work === customActivity
        );
        
        if (!exists) {
          currentData[absenceCatIndex] = {
            ...currentData[absenceCatIndex],
            items: [...currentData[absenceCatIndex].items, newAbsenceItem],
          };
          console.log('Updated data with new activity:', currentData);
          dispatch(setTimesheetData(currentData));
        } else {
          console.log('Activity already exists');
        }
      } else {
        // Create Absence category if it doesn't exist
        console.log('Creating new Absence category');
        currentData.push({
          category: 'Absence',
          items: [newAbsenceItem],
        });
        console.log('Updated data with new category:', currentData);
        dispatch(setTimesheetData(currentData));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const currentId = timesheetData.currentTimesheetId;
      const currentStatus = timesheetData.status;
      
      if (!currentId) {
        toast.error('No timesheet for this week');
        return;
      }
      
      if (![TimesheetStatus.Draft, TimesheetStatus.Rejected].includes(currentStatus as TimesheetStatus)) {
        toast.error('Only draft and rejected timesheets can be submitted');
        return;
      }
      
      if (isUnderMinimumHours) {
        toast.error(
          `Minimum 40 hours required. Current total: ${totalHours.toFixed(2)} hours`
        );
        return;
      }
      
      if (currentStatus === TimesheetStatus.Rejected) {
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

  const handleRequestEdit = async () => {
    try {
      const currentId = timesheetData.currentTimesheetId;
      if (!currentId) {
        toast.error('No timesheet to request edit for');
        return;
      }

      await requestTimesheetEdit(currentId);
      toast.success('Edit request sent to supervisors');
      await refresh();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to request edit';
      toast.error(errMsg);
    }
  };

  const isDataSavedInDB = JSON.stringify(timesheetData.timesheetData) === (timesheetData.originalDataHash || '');
  

  const isSubmitDisabled = ![TimesheetStatus.Draft, TimesheetStatus.Rejected].includes(timesheetData.status as TimesheetStatus) || 
    isUnderMinimumHours || 
    (timesheetData.status === TimesheetStatus.Draft && !isDataSavedInDB);
    
  
  const isSaveDisabled = timesheetData.status === TimesheetStatus.Rejected || 
    ![TimesheetStatus.Draft].includes(timesheetData.status as TimesheetStatus) ||
    isDataSavedInDB;
    
  const isSelectWorkDisabled = ![TimesheetStatus.Draft, TimesheetStatus.Rejected].includes(timesheetData.status as TimesheetStatus);
  
  // Request to Edit button should be enabled for Pending or Approved timesheets
  const isRequestEditDisabled = ![TimesheetStatus.Pending, TimesheetStatus.Approved].includes(timesheetData.status as TimesheetStatus) ||
    timesheetData.status === TimesheetStatus.EditRequested;

  return {
    totalHours,
    isUnderMinimumHours,
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
  };
};