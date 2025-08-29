import { Dispatch } from 'redux';
import { setWeekEndDate, setWeekStartDate, setCurrentTimesheetId, setTimesheetStatus } from '../store/slices/timesheetSlice';
import { getOrCreateMyTimesheetForWeek } from '../api/timesheet';

export interface WeekNavigationResult {
  success: boolean;
  wasCreated: boolean;
  error?: string;
}

export const navigateToWeekAndCreateTimesheet = async (
  offset: number,
  currentWeekStartDate: string,
  dispatch: Dispatch,
  onSuccess?: (wasCreated: boolean) => void,
  onError?: (error: string) => void
): Promise<WeekNavigationResult> => {
  try {
    // Validate current week start date
    if (!currentWeekStartDate) {
      const error = 'Current week start date is missing';
      console.error('Week navigation error:', error);
      if (onError) {
        onError(error);
      }
      return { success: false, wasCreated: false, error };
    }

    // Calculate the new week start date
    const newWeekStartDate = new Date(currentWeekStartDate);
    if (isNaN(newWeekStartDate.getTime())) {
      const error = `Invalid current week start date: ${currentWeekStartDate}`;
      console.error('Week navigation error:', error);
      if (onError) {
        onError(error);
      }
      return { success: false, wasCreated: false, error };
    }

    newWeekStartDate.setDate(newWeekStartDate.getDate() + offset * 7);
    newWeekStartDate.setHours(0, 0, 0, 0);

    const newWeekEndDate = new Date(newWeekStartDate);
    newWeekEndDate.setDate(newWeekStartDate.getDate() + 6);

    console.log('Navigating to week:', {
      offset,
      currentWeekStartDate,
      newWeekStartDate: newWeekStartDate.toISOString(),
      newWeekEndDate: newWeekEndDate.toISOString()
    });

    // Update Redux state with new week dates
    dispatch(setWeekStartDate(newWeekStartDate.toISOString()));
    dispatch(setWeekEndDate(newWeekEndDate.toISOString()));

    // Attempt to get or create timesheet for the new week
    const resp = await getOrCreateMyTimesheetForWeek(newWeekStartDate.toISOString());
    const ts = (resp.data as any).timesheet;
    const wasCreated = resp.status === 201;

    console.log('API response:', {
      status: resp.status,
      hasTimesheet: !!ts,
      timesheetId: ts?._id,
      wasCreated
    });

    if (ts?._id) {
      dispatch(setCurrentTimesheetId(ts._id));
      dispatch(setTimesheetStatus(ts.status));
      
      if (onSuccess) {
        onSuccess(wasCreated);
      }
      
      return { success: true, wasCreated };
    } else {
      const error = 'Failed to load or create timesheet - no timesheet data received';
      console.error('Week navigation error:', error, { response: resp.data });
      if (onError) {
        onError(error);
      }
      return { success: false, wasCreated: false, error };
    }
  } catch (error: any) {
    console.error('Week navigation error:', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      offset,
      currentWeekStartDate
    });

    const errorMessage = error.response?.data?.message || error.message || 'Failed to navigate to week';
    if (onError) {
      onError(errorMessage);
    }
    return { success: false, wasCreated: false, error: errorMessage };
  }
};

// Legacy function for backward compatibility
export const getWeekRangeAndUpdateRedux = (
  offset: number,
  currentWeekStartDate: string,
  dispatch: Dispatch
): void => {
  const weekStartDate = new Date(currentWeekStartDate);
  weekStartDate.setDate(weekStartDate.getDate() + offset * 7);
  weekStartDate.setHours(0, 0, 0, 0);

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);

  dispatch(setWeekStartDate(weekStartDate.toISOString()));
  dispatch(setWeekEndDate(weekEndDate.toISOString()));
};