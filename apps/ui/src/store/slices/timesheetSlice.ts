import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { absenceActivity } from '@tms/shared';
import { TimesheetData } from '../../components/organisms/TimeSheetTableCalander';

interface ITimesheetState {
  selectedActivities: absenceActivity[];
  timesheetData: TimesheetData[];
  weekStartDate: string | null;
}

const initialState: ITimesheetState = {
  selectedActivities: [],
  timesheetData: [],
  weekStartDate: null,
};

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState,
  reducers: {
    setSelectedActivities: (
      state,
      action: PayloadAction<absenceActivity[]>
    ) => {
      state.selectedActivities = action.payload;
    },
    setTimesheetData: (state, action: PayloadAction<TimesheetData[]>) => {
      state.timesheetData = action.payload;
    },
    setWeekStartDate: (state, action: PayloadAction<string | null>) => {
      state.weekStartDate = action.payload;
    },
  },
});

export default timesheetSlice.reducer;
export const { setSelectedActivities, setTimesheetData, setWeekStartDate } =
  timesheetSlice.actions;
