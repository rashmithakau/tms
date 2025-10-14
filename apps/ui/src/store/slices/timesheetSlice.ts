import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { TimesheetStatus, otherActivity } from '@tms/shared';
import { TimesheetData } from '../../interfaces/hooks/timesheet';
import { ITimesheetState } from '../../interfaces';

const initialState: ITimesheetState = {
  selectedActivities: [],
  timesheetData: [],
  weekStartDate: null,
  weekEndDate: null,
  currentTimesheetId: null,
  status: null,
  originalDataHash: null,
  isDraftSaved: false,
};

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState,
  reducers: {
    setSelectedActivities: (
      state,
      action: PayloadAction<otherActivity[]>
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
    setIsDraftSaved: (state, action: PayloadAction<boolean>) => {
      state.isDraftSaved = action.payload;
    },
  },
});

export default timesheetSlice.reducer;
export const { setSelectedActivities, setTimesheetData, setWeekStartDate, setWeekEndDate, setCurrentTimesheetId, setTimesheetStatus, setOriginalDataHash, setIsDraftSaved } =
  timesheetSlice.actions;
