import { useState, useEffect, useMemo } from 'react';
import { startOfWeek, addDays, isSameDay, format } from 'date-fns';
import { listProjects } from '../../api/project';
import { TimesheetStatus } from '@tms/shared';
import { TimeSheetRow } from '../../types/timesheet';

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

export interface DaySelection {
  timesheetId: string;
  categoryIndex: number;
  itemIndex: number;
  dayIndex: number;
}

export function useEmployeeTimesheetCalendar({
  timesheets,
  originalTimesheets = [],
  supervisedProjectIds = [],
}: {
  timesheets: TimeSheetRow[];
  originalTimesheets?: any[];
  supervisedProjectIds?: string[];
}) {
  const [data, setData] = useState<TimesheetData[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const utcDay = now.getUTCDay();
    const diffToMonday = (utcDay + 6) % 7;
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diffToMonday));
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [projects, setProjects] = useState<any[]>([]);

  const days = useMemo(() => {
    const start = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => ({
      day: format(addDays(start, i), 'EEE dd'),
      date: addDays(start, i),
    }));
  }, [currentWeekStart]);

  const weekOriginalTimesheet = useMemo(() => {
    if (!originalTimesheets || originalTimesheets.length === 0) return null;
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return originalTimesheets.find(ts => {
      const tsDate = new Date(ts.weekStartDate);
      return tsDate >= currentWeekStart && tsDate < weekEnd;
    });
  }, [originalTimesheets, currentWeekStart]);

  const weekTimesheets = useMemo(() => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return timesheets.filter(ts => {
      const tsDate = new Date(ts.date);
      return tsDate >= currentWeekStart && tsDate < weekEnd;
    });
  }, [timesheets, currentWeekStart]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const resp = await listProjects();
        setProjects(resp.data?.projects || []);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length === 0) return;
    const transformedData: TimesheetData[] = [];
    const projectMap = new Map<string, TimesheetItem>();
    const absenceMap = new Map<string, TimesheetItem>();
    projects.forEach(project => {
      projectMap.set(project._id, {
        work: project.projectName,
        projectId: project._id,
        hours: Array(7).fill('0.00'),
        descriptions: Array(7).fill(''),
        dailyStatus: Array(7).fill(TimesheetStatus.Draft),
      });
    });
    weekTimesheets.forEach(ts => {
      const dayIndex = days.findIndex(day => isSameDay(day.date, new Date(ts.date)));
      if (dayIndex >= 0) {
        if (ts.projectId && projectMap.has(ts.projectId)) {
          const item = projectMap.get(ts.projectId)!;
          item.hours[dayIndex] = (ts.hoursSpent || 0).toFixed(2);
          item.descriptions[dayIndex] = ts.description || '';
          if (ts.dailyStatus && ts.dailyStatus[dayIndex]) {
            item.dailyStatus![dayIndex] = ts.dailyStatus[dayIndex];
          }
        } else if (ts.task) {
          if (!absenceMap.has(ts.task)) {
            absenceMap.set(ts.task, {
              work: ts.task,
              hours: Array(7).fill('0.00'),
              descriptions: Array(7).fill(''),
              dailyStatus: Array(7).fill(TimesheetStatus.Draft),
            });
          }
          const item = absenceMap.get(ts.task)!;
          item.hours[dayIndex] = (ts.hoursSpent || 0).toFixed(2);
          item.descriptions[dayIndex] = ts.description || '';
          if (ts.dailyStatus && ts.dailyStatus[dayIndex]) {
            item.dailyStatus![dayIndex] = ts.dailyStatus[dayIndex];
          }
        }
      }
    });
    const projectItems = Array.from(projectMap.values()).filter(item =>
      item.hours.some(hour => parseFloat(hour) > 0)
    );
    const absenceItems = Array.from(absenceMap.values());
    if (projectItems.length > 0) {
      transformedData.push({ category: 'Project', items: projectItems });
    }
    if (absenceItems.length > 0) {
      transformedData.push({ category: 'Absence', items: absenceItems });
    }
    setData(transformedData);
  }, [weekTimesheets, projects, days]);

  const handlePreviousWeek = () => {
    const previousWeek = new Date(currentWeekStart);
    previousWeek.setUTCDate(previousWeek.getUTCDate() - 7);
    setCurrentWeekStart(previousWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  return {
    data,
    days,
    isLoading,
    setIsLoading,
    currentWeekStart,
    setCurrentWeekStart,
    handlePreviousWeek,
    handleNextWeek,
    weekOriginalTimesheet,
    supervisedProjectIds,
  };
}
