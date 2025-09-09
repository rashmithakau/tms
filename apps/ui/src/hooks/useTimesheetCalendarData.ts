import { useState, useEffect, useMemo } from 'react';
import { startOfWeek, addDays, isSameDay } from 'date-fns';
import { listProjects } from '../api/project';
import { TimesheetStatus } from '@tms/shared'; 
import { Timesheet } from '../api/timesheet';

export function useTimesheetCalendarData(
  timesheets: Timesheet[], 
  originalTimesheets: Timesheet[]
) {
  const [data, setData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const utcDay = now.getUTCDay();
    const diffToMonday = (utcDay + 6) % 7;
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diffToMonday));
  });

  const days = useMemo(() => {
    const start = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => ({
      day: start.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit' }),
      date: addDays(start, i),
    }));
  }, [currentWeekStart]);

  useEffect(() => {
    setIsLoading(true);
    listProjects().then(resp => {
      setProjects(resp.data?.projects || []);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (projects.length === 0) return;
  }, [timesheets, projects, days]);

  return {
    data,
    days,
    isLoading,
    currentWeekStart,
    setCurrentWeekStart,
    projects,
  };
}
