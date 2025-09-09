import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWeekRangeAndUpdateRedux } from '../utils/getWeekRangeAndUpdateRedux';
import {
  setCurrentTimesheetId,
  setTimesheetStatus,
  setWeekEndDate,
  setWeekStartDate,
} from '../store/slices/timesheetSlice';
import { getOrCreateMyTimesheetForWeek } from '../api/timesheet';

export const useTimesheetWeekNavigation = () => {
  const dispatch = useDispatch();
  const timesheetData = useSelector((state: any) => state.timesheet);
  const currentWeekStartDate = useSelector(
    (state: any) => state.timesheet.weekStartDate
  );

  // Initialize week range if not set
  const initializeWeek = () => {
    if (!timesheetData.weekStartDate || !timesheetData.weekEndDate) {
      const now = new Date();
      const utcDay = now.getUTCDay(); // 0=Sun..6=Sat
      const diffToMonday = (utcDay + 6) % 7;
      const monday = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() - diffToMonday
        )
      );
      const sunday = new Date(
        Date.UTC(
          monday.getUTCFullYear(),
          monday.getUTCMonth(),
          monday.getUTCDate() + 6
        )
      );
      dispatch(setWeekStartDate(monday.toISOString().slice(0, 10)));
      dispatch(setWeekEndDate(sunday.toISOString().slice(0, 10)));
    }
  };

  // Load timesheet for the current selected week
  const loadTimesheetForWeek = async () => {
    try {
      const weekIso = timesheetData.weekStartDate ?? undefined;
      const resp = await getOrCreateMyTimesheetForWeek(weekIso);
      const ts = (resp.data as any).timesheet;
      if (ts?._id) {
        dispatch(setCurrentTimesheetId(ts._id));
        dispatch(setTimesheetStatus(ts.status));
      }
    } catch (e) {
      console.error('Failed to load timesheet for week:', e);
    }
  };

  // Navigation handlers
  const handleNextWeek = () => {
    getWeekRangeAndUpdateRedux(1, currentWeekStartDate, dispatch);
  };

  const handlePreviousWeek = () => {
    getWeekRangeAndUpdateRedux(-1, currentWeekStartDate, dispatch);
  };

  // Format week range for display
  const getFormattedWeekRange = () => {
    const startDate = timesheetData.weekStartDate
      ? new Date(timesheetData.weekStartDate + 'T00:00:00Z').toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: '2-digit',
          timeZone: 'UTC',
        })
      : 'Loading...';

    const endDate = timesheetData.weekEndDate
      ? new Date(timesheetData.weekEndDate + 'T00:00:00Z').toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          timeZone: 'UTC',
        })
      : 'Loading...';

    return { startDate, endDate };
  };

  // Initialize week range and load timesheet on mount or week change
  useEffect(() => {
    initializeWeek();
    const load = async () => {
      await loadTimesheetForWeek();
    };
    load();
  }, [dispatch, timesheetData.weekStartDate]);

  return {
    timesheetData,
    currentWeekStartDate,
    handleNextWeek,
    handlePreviousWeek,
    getFormattedWeekRange,
    loadTimesheetForWeek,
  };
};