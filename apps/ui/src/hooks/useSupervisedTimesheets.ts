import { useCallback, useEffect, useState } from 'react';
import { listSupervisedTimesheets } from '../api/timesheet';
import { TimeSheetRow } from '../types/timesheet';

export const useSupervisedTimesheets = () => {
  const [rows, setRows] = useState<TimeSheetRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const resp = await listSupervisedTimesheets();
      console.log('Supervised timesheets response:', resp);
      const data = resp.data?.timesheets || [];
      const mapped: TimeSheetRow[] = data.map((t: any) => ({
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
        employee: t.userId ? {
          _id: t.userId._id,
          firstName: t.userId.firstName,
          lastName: t.userId.lastName,
          email: t.userId.email,
          contactNumber: t.userId.contactNumber,
          designation: t.userId.designation,
        } : undefined,
      }));
      setRows(mapped);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load supervised timesheets';
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
