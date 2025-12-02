import { useCallback, useEffect, useState } from 'react';
import { listMyTimesheets } from '../../api/timesheet';
import { ITimeSheetRow } from '../../interfaces/entity/ITimeSheetRow';

export const useTimesheets = () => {
  const [rows, setRows] = useState<ITimeSheetRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const resp = await listMyTimesheets();
      const data = resp.data?.timesheets || [];
      const mapped: ITimeSheetRow[] = data.map((t: any) => ({
        _id: t._id,
        date: t.date,
        projectId: t.projectId,
        projectName: t.projectId?.projectName || t.projectName || 'Unknown Project',
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



