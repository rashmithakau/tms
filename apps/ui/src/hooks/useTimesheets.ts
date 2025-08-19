import { useCallback, useEffect, useState } from 'react';
import { listMyTimesheets } from '../api/timesheet';
import { TimeSheetRow } from '../types/timesheet';

export const useTimesheets = () => {
  const [rows, setRows] = useState<TimeSheetRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const resp = await listMyTimesheets();
      const data = resp.data?.timesheets || [];
      const mapped: TimeSheetRow[] = data.map((t: any) => ({
        _id: t._id,
        date: t.date,
        project: t.projectName,
        task: t.taskTitle,
        billableType: t.billableType,
        status: t.status,
        plannedHours: t.plannedHours,
        hoursSpent: t.hoursSpent,
        description: t.description,
      }));
      setRows(mapped);
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



