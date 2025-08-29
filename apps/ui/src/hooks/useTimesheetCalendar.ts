import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { startOfWeek, addDays, format } from 'date-fns';
import { RootState } from '../store/store';
import {
  setTimesheetData,
  setWeekEndDate,
  setWeekStartDate,
  setCurrentTimesheetId,
  setTimesheetStatus,
  setOriginalDataHash,
} from '../store/slices/timesheetSlice';
import { getOrCreateMyTimesheetForWeek, Timesheet } from '../api/timesheet';
import { listProjects } from '../api/project';
import { TimesheetData, TimesheetItem } from './useTimesheetCalculations';

export interface WeekDay {
  day: string;
  date: Date;
}

const buildWeekFrom = (startDate: Date): WeekDay[] => {
  const start = startOfWeek(startDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }).map((_, i) => ({
    day: format(addDays(start, i), 'EEE dd'),
    date: addDays(start, i),
  }));
};

export const useTimesheetCalendar = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState<TimesheetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTimesheet, setIsCreatingTimesheet] = useState(false);

  // Redux selectors
  const selectedWeekStartIso = useSelector(
    (state: RootState) => state.timesheet.weekStartDate
  );
  const timesheetStatus = useSelector(
    (state: RootState) => state.timesheet.status
  );
  const selectedActivities = useSelector(
    (state: RootState) => state.timesheet.selectedActivities
  );

  // Calculate week days
  const selectedWeekStart = useMemo(
    () =>
      selectedWeekStartIso
        ? new Date(selectedWeekStartIso)
        : startOfWeek(new Date(), { weekStartsOn: 1 }),
    [selectedWeekStartIso]
  );

  const days = useMemo(
    () => buildWeekFrom(selectedWeekStart),
    [selectedWeekStart]
  );

  // Generate absence rows from selected activities
  const absenceRows: TimesheetItem[] = useMemo(
    () =>
      selectedActivities.map((activity: string) => ({
        work: activity,
        hours: Array(7).fill('00.00'),
        descriptions: Array(7).fill(''),
      })),
    [selectedActivities]
  );

  // Update Redux state when data changes
  useEffect(() => {
    dispatch(setTimesheetData(data));
  }, [data, dispatch]);

  // Update week range in Redux
  useEffect(() => {
    dispatch(setWeekStartDate(days[0].date.toISOString()));
    dispatch(setWeekEndDate(days[6].date.toISOString()));
  }, [dispatch, days]);

  // Fetch timesheet data
  const fetchTimesheetData = useCallback(async (showCreationMessage = false) => {
    try {
      setLoading(true);
      setError(null);
      setIsCreatingTimesheet(false);

      // Fetch projects
      const projectsResponse = await listProjects();
      const fetchedProjects = (projectsResponse.data as any)?.projects || [];

      // Build project rows
      const projectRows: TimesheetItem[] = fetchedProjects.map((project: any) => ({
        work: project.projectName,
        projectId: project._id,
        hours: Array(7).fill('00.00'),
        descriptions: Array(7).fill(''),
      }));

      setIsCreatingTimesheet(true);
      
      // Fetch or create timesheet for current week
      const resp = await getOrCreateMyTimesheetForWeek(
        days[0].date.toISOString()
      );
      const existing: Timesheet | undefined = (resp.data as any).timesheet;
      const wasCreated = resp.status === 201;

      if (existing) {
        dispatch(setCurrentTimesheetId(existing._id));
        dispatch(setTimesheetStatus(existing.status as any));
        const existingData: any[] = (existing as any).data || [];

        // Show creation message if requested and timesheet was just created
        if (showCreationMessage && wasCreated) {
          // This will be handled by the parent component
        }

        // Merge existing data with new projects/activities if in Draft status
        let nextData = existingData;
        if ((existing.status as any) === 'Draft') {
          // Merge missing Project rows
          const projectCatIndex = nextData.findIndex((c) => c.category === 'Project');
          if (projectCatIndex >= 0) {
            const presentProjectIds = new Set(
              (nextData[projectCatIndex].items || []).map((it: any) => it.projectId)
            );
            const newProjectItems = projectRows.filter(
              (row) => row.projectId && !presentProjectIds.has(row.projectId)
            );
            if (newProjectItems.length > 0) {
              nextData = nextData.map((c, i) =>
                i === projectCatIndex
                  ? { ...c, items: [...c.items, ...newProjectItems] }
                  : c
              );
            }
          } else if (projectRows.length > 0) {
            nextData = [{ category: 'Project' as const, items: projectRows }, ...nextData];
          }

          // Merge missing Absence rows
          const absenceCatIndex = nextData.findIndex((c) => c.category === 'Absence');
          if (absenceCatIndex >= 0) {
            const presentWorks = new Set(
              (nextData[absenceCatIndex].items || []).map((it: any) => it.work)
            );
            const newItems = absenceRows.filter(
              (row) => row.work && !presentWorks.has(row.work)
            );
            if (newItems.length > 0) {
              nextData = nextData.map((c, i) =>
                i === absenceCatIndex
                  ? { ...c, items: [...c.items, ...newItems] }
                  : c
              );
            }
          } else if (absenceRows.length > 0) {
            nextData = [...nextData, { category: 'Absence' as const, items: absenceRows }];
          }
        }

        setData(nextData);
        dispatch(setOriginalDataHash(JSON.stringify(nextData)));
      } else {
        // Create new timesheet data
        const initialData: TimesheetData[] = [
          { category: 'Project' as const, items: projectRows },
          { category: 'Absence' as const, items: absenceRows },
        ];
        setData(initialData);
        dispatch(setOriginalDataHash(JSON.stringify(initialData)));
      }
      
      return { wasCreated, timesheet: existing };
    } catch (err: any) {
      setError(err.message || 'Failed to fetch timesheet data');
      console.error('Failed to fetch timesheet data:', err);
      return { wasCreated: false, timesheet: null };
    } finally {
      setLoading(false);
      setIsCreatingTimesheet(false);
    }
  }, [selectedActivities, days, dispatch, absenceRows]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchTimesheetData();
  }, [fetchTimesheetData]);

  // Update timesheet data
  const updateTimesheetData = useCallback((newData: TimesheetData[]) => {
    setData(newData);
  }, []);

  return {
    data,
    days,
    loading: loading || isCreatingTimesheet,
    error,
    timesheetStatus,
    updateTimesheetData,
    refetch: fetchTimesheetData,
    isCreatingTimesheet,
  };
};