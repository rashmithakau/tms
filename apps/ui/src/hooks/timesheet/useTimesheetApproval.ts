import { useState } from 'react';
import { TimesheetStatus } from '@tms/shared';
import { DaySelection, TimesheetApprovalReturn } from '../../interfaces/hooks/timesheet';
import { useToast } from '../../contexts/ToastContext';
import { batchUpdateDailyTimesheetStatusApi } from '../../api/timesheet';

export const useTimesheetApproval = (refresh: () => Promise<void>): TimesheetApprovalReturn => {
  const toast = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<DaySelection[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState<{
    open: boolean;
    selectedDays: DaySelection[];
  }>({ open: false, selectedDays: [] });

  const applyStatusToSelected = async (status: TimesheetStatus, pendingIdsInFiltered: string[]) => {
    const selectedPendingIds = selectedIds.filter((id) => pendingIdsInFiltered.includes(id));
    if (selectedPendingIds.length === 0) return;
    
    try {
      const { updateSupervisedTimesheetsStatusApi } = await import('../../api/timesheet');
      const narrowed = status === TimesheetStatus.Approved ? TimesheetStatus.Approved : TimesheetStatus.Rejected;
      await updateSupervisedTimesheetsStatusApi(selectedPendingIds, narrowed);
      await refresh();
      setSelectedIds([]);
      toast.success(`Timesheets ${narrowed.toLowerCase()}`);
    } catch (e) {
      console.error('Failed to update status', e);
      toast.error('Failed to update timesheet status');
    }
  };

  
  const applyDailyStatusToSelected = async (
    status: TimesheetStatus.Approved | TimesheetStatus.Rejected,
    rejectionReason?: string
  ) => {
    if (selectedDays.length === 0) {
      toast.error('No days selected for approval');
      return;
    }

    try {
   
      const updates: Array<{
        timesheetId: string;
        categoryIndex: number;
        itemIndex: number;
        dayIndices: number[];
        status: TimesheetStatus.Approved | TimesheetStatus.Rejected;
        rejectionReason?: string;
      }> = [];


      const groupedUpdates = new Map<string, {
        timesheetId: string;
        categoryIndex: number;
        itemIndex: number;
        dayIndices: number[];
        status: TimesheetStatus.Approved | TimesheetStatus.Rejected;
        rejectionReason?: string;
      }>();
      
      selectedDays.forEach((selection, index) => {
        console.log(`Processing selection ${index + 1}:`, selection);
        const key = `${selection.timesheetId}-${selection.categoryIndex}-${selection.itemIndex}`;
        if (groupedUpdates.has(key)) {
          groupedUpdates.get(key)!.dayIndices.push(selection.dayIndex);
        } else {
          groupedUpdates.set(key, {
            timesheetId: selection.timesheetId,
            categoryIndex: selection.categoryIndex,
            itemIndex: selection.itemIndex,
            dayIndices: [selection.dayIndex],
            status,
            rejectionReason: status === TimesheetStatus.Rejected ? rejectionReason : undefined
          });
        }
      });

      updates.push(...Array.from(groupedUpdates.values()));
      
      await batchUpdateDailyTimesheetStatusApi(updates);

      await refresh();
      

      const timesheetIds = Array.from(new Set(selectedDays.map(s => s.timesheetId)));
      

      await new Promise(resolve => setTimeout(resolve, 100));
      
      
      const { listSupervisedTimesheets } = await import('../../api/timesheet');
      const latestResponse = await listSupervisedTimesheets();
      const latestTimesheets = latestResponse.data?.timesheets || [];
      
      const timesheetsToUpdateOverall: string[] = [];
      
      for (const timesheetId of timesheetIds) {
    
        const updatedTimesheet = latestTimesheets.find((ts: any) => ts._id === timesheetId);
        if (!updatedTimesheet) continue;

  
        let allSelectableDaysApproved = true;
        let hasSelectableDays = false;
        
        (updatedTimesheet as any).data.forEach((category: any) => {
          category.items.forEach((item: any) => {
            item.hours.forEach((hour: string, dayIndex: number) => {
              if (parseFloat(hour) > 0) {
                hasSelectableDays = true;
                const dayStatus = item.dailyStatus?.[dayIndex];
                if (dayStatus !== TimesheetStatus.Approved) {
                  allSelectableDaysApproved = false;
                }
              }
            });
          });
        });
        
       
        if (hasSelectableDays && allSelectableDaysApproved && status === TimesheetStatus.Approved) {
          timesheetsToUpdateOverall.push(timesheetId);
        }
      }

      
      if (timesheetsToUpdateOverall.length > 0) {
        const { updateSupervisedTimesheetsStatusApi } = await import('../../api/timesheet');
        await updateSupervisedTimesheetsStatusApi(timesheetsToUpdateOverall, TimesheetStatus.Approved);
        await refresh(); 
      }
      
      setSelectedDays([]);
      setIsSelectionMode(false);
      
      const statusText = status.toLowerCase();
      if (timesheetsToUpdateOverall.length > 0) {
        toast.success(`Selected days ${statusText} and ${timesheetsToUpdateOverall.length} timesheet(s) overall status updated to ${statusText}`);
      } else {
        toast.success(`Selected days ${statusText}`);
      }
    } catch (e: any) {
      console.error('Failed to update daily status');
      console.error('Error details:', {
        message: e.message,
        response: e.response?.data,
        status: e.response?.status,
        statusText: e.response?.statusText,
        stack: e.stack
      });
      console.error('Selected days that caused error:', selectedDays);
      console.error('Status attempted:', status);
      toast.error(`Failed to update daily status: ${e.response?.data?.message || e.message || 'Unknown error'}`);
    }
  };

  const handleRejectWithReason = (reason: string) => {
    applyDailyStatusToSelected(TimesheetStatus.Rejected, reason);
  };


  const handleRejectClick = () => {
    if (selectedDays.length === 0) {
      toast.error('No days selected for rejection');
      return;
    }
    setRejectionDialog({ open: true, selectedDays: [...selectedDays] });
  };


  const handleDaySelectionChange = (selections: DaySelection[]) => {
    setSelectedDays(selections);
  };


  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedDays([]);
    }
  };

  return {
    selectedIds,
    setSelectedIds,
    selectedDays,
    setSelectedDays,
    isSelectionMode,
    setIsSelectionMode,
    rejectionDialog,
    setRejectionDialog,
    applyStatusToSelected,
    applyDailyStatusToSelected,
    handleRejectWithReason,
    handleRejectClick,
    handleDaySelectionChange,
    toggleSelectionMode,
  };
};