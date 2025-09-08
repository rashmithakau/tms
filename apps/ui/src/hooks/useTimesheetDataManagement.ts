import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { TimesheetStatus } from '@tms/shared';
import { startOfWeek } from 'date-fns';
import { getOrCreateMyTimesheetForWeek, Timesheet } from '../api/timesheet';
import { listProjects } from '../api/project';
import {
  setTimesheetData,
  setWeekStartDate,
  setCurrentTimesheetId,
  setTimesheetStatus,
  setOriginalDataHash,
} from '../store/slices/timesheetSlice';

export interface TimesheetItem {
  work?: string;
  projectId?: string;
  hours: string[];
  descriptions: string[];
  dailyStatus?: TimesheetStatus[];
}

export interface TimesheetData {
  category: 'Project' | 'Absence';
  items: TimesheetItem[];
}

export const useTimesheetDataManagement = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState<TimesheetData[]>([]);
  
  const selectedWeekStartIso = useSelector((state: RootState) => state.timesheet.weekStartDate);
  const timesheetStatus = useSelector((state: RootState) => state.timesheet.status);
  const selectedActivities = useSelector((state: RootState) => state.timesheet.selectedActivities);

  // Create absence rows from selected activities
  const createAbsenceRows = (): TimesheetItem[] => {
    return selectedActivities.map((activity: string) => ({
      work: activity,
      hours: Array(7).fill('00.00'),
      descriptions: Array(7).fill(''),
      dailyStatus: Array(7).fill(TimesheetStatus.Draft),
    }));
  };

  // Update Redux store when data changes
  useEffect(() => {
    dispatch(setTimesheetData(data));
  }, [data, dispatch]);

  // Initialize week start date if not set
  useEffect(() => {
    if (!selectedWeekStartIso) {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
        .toISOString()
        .slice(0, 10);
      dispatch(setWeekStartDate(weekStart));
    }
  }, [dispatch, selectedWeekStartIso]);

  // Fetch projects and timesheet data
  useEffect(() => {
    if (!selectedWeekStartIso) return;

    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsResponse = await listProjects();
        const fetchedProjects = (projectsResponse.data as any)?.projects || [];

        // Build project rows
        const projectRows: TimesheetItem[] = fetchedProjects.map((project: any) => ({
          work: project.projectName,
          projectId: project._id,
          hours: Array(7).fill('00.00'),
          descriptions: Array(7).fill(''),
          dailyStatus: Array(7).fill(TimesheetStatus.Draft),
        }));

        const absenceRows = createAbsenceRows();

        // Fetch or create timesheet for current week
        const resp = await getOrCreateMyTimesheetForWeek(selectedWeekStartIso);
        const existing: Timesheet | undefined = (resp.data as any).timesheet;

        if (existing) {
          dispatch(setCurrentTimesheetId(existing._id));
          dispatch(setTimesheetStatus(existing.status as any));
          
          const existingData: any[] = (existing as any).data || [];
          let nextData = existingData;

          // Merge in missing data if status is Draft
          if ((existing.status as any) === 'Draft') {
            nextData = mergeNewItems(nextData, projectRows, absenceRows);
          }

          setData(nextData);
          dispatch(setOriginalDataHash(JSON.stringify(nextData)));
        } else {
          const initialData = [
            { category: 'Project' as const, items: projectRows },
            { category: 'Absence' as const, items: absenceRows },
          ];
          setData(initialData);
          dispatch(setOriginalDataHash(JSON.stringify(initialData)));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [selectedActivities, selectedWeekStartIso, dispatch]);

  // Helper function to merge new items into existing data
  const mergeNewItems = (
    existingData: any[],
    projectRows: TimesheetItem[],
    absenceRows: TimesheetItem[]
  ) => {
    let nextData = [...existingData];

    // Merge project items
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
          i === projectCatIndex ? { ...c, items: [...c.items, ...newProjectItems] } : c
        );
      }
    } else if (projectRows.length > 0) {
      nextData = [{ category: 'Project', items: projectRows }, ...nextData];
    }

    // Merge absence items
    const absenceCatIndex = nextData.findIndex((c) => c.category === 'Absence');
    if (absenceCatIndex >= 0) {
      const presentWorks = new Set(
        (nextData[absenceCatIndex].items || []).map((it: any) => it.work)
      );
      const newItems = absenceRows.filter((row) => row.work && !presentWorks.has(row.work));
      if (newItems.length > 0) {
        nextData = nextData.map((c, i) =>
          i === absenceCatIndex ? { ...c, items: [...c.items, ...newItems] } : c
        );
      }
    } else if (absenceRows.length > 0) {
      nextData = [...nextData, { category: 'Absence', items: absenceRows }];
    }

    return nextData;
  };

  // Update data
  const updateData = (newData: TimesheetData[]) => {
    setData(newData);
  };

  return {
    data,
    updateData,
    timesheetStatus,
    selectedWeekStartIso,
  };
};