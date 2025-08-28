import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { TimesheetStatus, absenceActivity } from '@tms/shared';
import { TimesheetData } from '../../components/organisms/TimeSheetTableCalander';

interface ITimesheetState {
  selectedActivities: absenceActivity[];
  timesheetData: TimesheetData[];
  weekStartDate: string | null;
  weekEndDate: string | null;
  currentTimesheetId: string | null;
  status: TimesheetStatus | null;
  originalDataHash: string | null;
}

const initialState: ITimesheetState = {
  selectedActivities: [],
  timesheetData: [],
  weekStartDate: null,
  weekEndDate: null,
  currentTimesheetId: null,
  status: null,
  originalDataHash: null,
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
    setWeekEndDate: (state, action: PayloadAction<string | null>) => {
      state.weekEndDate = action.payload;
    },
    setCurrentTimesheetId: (state, action: PayloadAction<string | null>) => {
      state.currentTimesheetId = action.payload;
    },
    setTimesheetStatus: (state, action: PayloadAction<TimesheetStatus | null>) => {
      state.status = action.payload;
    },
    setOriginalDataHash: (state, action: PayloadAction<string | null>) => {
      state.originalDataHash = action.payload;
    },
  },
});

export default timesheetSlice.reducer;
export const { setSelectedActivities, setTimesheetData, setWeekStartDate, setWeekEndDate, setCurrentTimesheetId, setTimesheetStatus, setOriginalDataHash } =
  timesheetSlice.actions;
