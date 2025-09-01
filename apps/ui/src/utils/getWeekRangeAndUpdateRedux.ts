import { Dispatch } from 'redux';
import { setWeekEndDate, setWeekStartDate } from '../store/slices/timesheetSlice';

export const getWeekRangeAndUpdateRedux = (
  offset: number,
  currentWeekStartDate: string,
  dispatch: Dispatch
): void => {
  const weekStartDate = new Date(currentWeekStartDate);
  // Use UTC methods to prevent timezone-related date shifts
  weekStartDate.setUTCDate(weekStartDate.getUTCDate() + offset * 7);
  weekStartDate.setUTCHours(0, 0, 0, 0);

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setUTCDate(weekStartDate.getUTCDate() + 6);

  dispatch(setWeekStartDate(weekStartDate.toISOString().slice(0, 10)));
  dispatch(setWeekEndDate(weekEndDate.toISOString().slice(0, 10)));
};

