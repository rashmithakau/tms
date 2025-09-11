import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { TimesheetStatus } from '@tms/shared';
import { startOfWeek } from 'date-fns';
import { getOrCreateMyTimesheetForWeek, Timesheet } from '../api/timesheet';
import { listProjects } from '../api/project';
import { listMyTeams } from '../api/team';
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
  teamId?: string;
  hours: string[];
  descriptions: string[];
  dailyStatus?: TimesheetStatus[];
}

export interface TimesheetData {
  category: 'Project' | 'Team' | 'Absence';
  items: TimesheetItem[];
}

export const useTimesheetDataManagement = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState<TimesheetData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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
        setIsLoading(true);
        setError(null);
        
        // Fetch projects and teams in parallel
        const [projectsResponse, teamsResponse] = await Promise.all([
          listProjects(),
          listMyTeams()
        ]);
        
        const fetchedProjects = (projectsResponse.data as any)?.projects || [];
        const fetchedTeams = (teamsResponse.data as any)?.teams || [];

        // Build project rows
        const projectRows: TimesheetItem[] = fetchedProjects.map((project: any) => ({
          work: project.projectName,
          projectId: project._id,
          hours: Array(7).fill('00.00'),
          descriptions: Array(7).fill(''),
          dailyStatus: Array(7).fill(TimesheetStatus.Draft),
        }));

        // Build team rows
        const teamRows: TimesheetItem[] = fetchedTeams.map((team: any) => ({
          work: team.teamName,
          teamId: team._id,
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
            nextData = mergeNewItems(nextData, projectRows, teamRows, absenceRows);
          }

          setData(nextData);
          dispatch(setOriginalDataHash(JSON.stringify(nextData)));
        } else {
          const initialData = [
            { category: 'Project' as const, items: projectRows },
            { category: 'Team' as const, items: teamRows },
            { category: 'Absence' as const, items: absenceRows },
          ];
          setData(initialData);
          dispatch(setOriginalDataHash(JSON.stringify(initialData)));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load timesheet data');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedActivities, selectedWeekStartIso, dispatch]);

  // Helper function to merge new items into existing data
  const mergeNewItems = (
    existingData: any[],
    projectRows: TimesheetItem[],
    teamRows: TimesheetItem[],
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

    // Merge team items
    const teamCatIndex = nextData.findIndex((c) => c.category === 'Team');
    if (teamCatIndex >= 0) {
      const presentTeamIds = new Set(
        (nextData[teamCatIndex].items || []).map((it: any) => it.teamId)
      );
      const newTeamItems = teamRows.filter(
        (row) => row.teamId && !presentTeamIds.has(row.teamId)
      );
      if (newTeamItems.length > 0) {
        nextData = nextData.map((c, i) =>
          i === teamCatIndex ? { ...c, items: [...c.items, ...newTeamItems] } : c
        );
      }
    } else if (teamRows.length > 0) {
      // Insert team category after project category or at the beginning
      const projectCatIndex = nextData.findIndex((c) => c.category === 'Project');
      const insertIndex = projectCatIndex >= 0 ? projectCatIndex + 1 : 0;
      nextData.splice(insertIndex, 0, { category: 'Team', items: teamRows });
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
    isLoading,
    error,
  };
};