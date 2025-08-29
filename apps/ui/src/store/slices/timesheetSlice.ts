import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { TimesheetStatus, absenceActivity } from '@tms/shared';
import { TimesheetData } from '../../components/organisms/TimeSheetTableCalander';
import { RootState } from '../store';

interface ITimesheetState {
  selectedActivities: absenceActivity[];
  timesheetData: TimesheetData[];
  weekStartDate: string | null;
  weekEndDate: string | null;
  currentTimesheetId: string | null;
  status: TimesheetStatus | null;
  originalDataHash: string | null;
  isDataChanged: boolean;
  lastSavedAt: string | null;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: ITimesheetState = {
  selectedActivities: [],
  timesheetData: [],
  weekStartDate: null,
  weekEndDate: null,
  currentTimesheetId: null,
  status: null,
  originalDataHash: null,
  isDataChanged: false,
  lastSavedAt: null,
  isSubmitting: false,
  error: null,
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
      // Check if data has changed
      const currentHash = JSON.stringify(action.payload);
      state.isDataChanged = state.originalDataHash ? currentHash !== state.originalDataHash : false;
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
      state.isDataChanged = false;
    },
    setIsSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setLastSavedAt: (state, action: PayloadAction<string | null>) => {
      state.lastSavedAt = action.payload;
    },
    resetTimesheetState: () => initialState,
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Selectors
const selectTimesheetState = (state: RootState) => state.timesheet;

export const selectTimesheetData = createSelector(
  [selectTimesheetState],
  (timesheet) => timesheet.timesheetData
);

export const selectIsTimesheetEditable = createSelector(
  [selectTimesheetState],
  (timesheet) => timesheet.status === TimesheetStatus.Draft
);

export const selectHasUnsavedChanges = createSelector(
  [selectTimesheetState],
  (timesheet) => timesheet.isDataChanged
);

export const selectTimesheetTotals = createSelector(
  [selectTimesheetData],
  (data) => {
    const columnTotals = Array.from({ length: 7 }, (_, colIndex) =>
      data
        .flatMap((cat) => cat.items)
        .reduce((sum, row) => sum + parseFloat(row.hours[colIndex] || '0'), 0)
        .toFixed(2)
    );
    
    const grandTotal = data
      .flatMap((cat) => cat.items)
      .reduce(
        (sum, row) =>
          sum + row.hours.reduce((s, h) => s + parseFloat(h || '0'), 0),
        0
      )
      .toFixed(2);
    
    return { columnTotals, grandTotal };
  }
);

export const selectCurrentWeekRange = createSelector(
  [selectTimesheetState],
  (timesheet) => ({
    startDate: timesheet.weekStartDate,
    endDate: timesheet.weekEndDate,
  })
);

export default timesheetSlice.reducer;
export const {
  setSelectedActivities,
  setTimesheetData,
  setWeekStartDate,
  setWeekEndDate,
  setCurrentTimesheetId,
  setTimesheetStatus,
  setOriginalDataHash,
  setIsSubmitting,
  setError,
  setLastSavedAt,
  resetTimesheetState,
  clearError,
} = timesheetSlice.actions;
