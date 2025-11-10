import { useState, useEffect, useCallback } from 'react';
import { listMyDailyTimesheets, DailyTimesheetEntry } from '../../api/dailyTimesheet';

export const useDailyTimesheets = () => {
  const [rows, setRows] = useState<DailyTimesheetEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await listMyDailyTimesheets();
      const timesheets = response.data?.timesheets || [];
      
      // Sort by date descending (newest first)
      timesheets.sort((a, b) => new Date(b.date || new Date()).getTime() - new Date(a.date || new Date()).getTime());
      
      setRows(timesheets);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load timesheets';
      setError(message);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rows, isLoading, error, refresh: fetchData };
};
