import { Dispatch } from 'redux';
import { setWeekEndDate, setWeekStartDate } from '../store/slices/timesheetSlice';

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

  dispatch(setWeekStartDate(String(weekStartDate)));
  dispatch(setWeekEndDate(String(weekEndDate)));
};

