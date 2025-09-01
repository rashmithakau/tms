import { useCallback, useEffect, useState } from 'react';
import { listSupervisedTimesheets, Timesheet } from '../api/timesheet';
import { TimeSheetRow } from '../types/timesheet';

export const useSupervisedTimesheets = () => {
  const [rows, setRows] = useState<TimeSheetRow[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]); // Add original timesheet data
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const resp = await listSupervisedTimesheets();
      const data = resp.data?.timesheets || [];
      
      // Store original timesheets for calendar component
      setTimesheets(data);
      
      // Flatten the timesheet structure into individual rows
      const mapped: TimeSheetRow[] = [];
      
      data.forEach((timesheet: any) => {
        const weekStartDate = new Date(timesheet.weekStartDate);
        
        // Iterate through categories (Project/Absence)
        timesheet.data?.forEach((category: any) => {
          // Iterate through items in each category
          category.items?.forEach((item: any) => {
            // Create a row for each day that has hours
            item.hours?.forEach((hours: string, dayIndex: number) => {
              if (hours && hours !== '0' && hours !== '0.00' && hours.trim() !== '') {
                // Calculate the specific date for this day
                const itemDate = new Date(weekStartDate);
                itemDate.setUTCDate(itemDate.getUTCDate() + dayIndex);
                
                mapped.push({
                  _id: `${timesheet._id}-${category.category}-${item.work || item.projectId || 'item'}-${dayIndex}`,
                  date: itemDate.toISOString().split('T')[0], // YYYY-MM-DD format
                  projectId: item.projectId || '',
                  projectName: (item as any).projectName || item.work || 'Unknown',
                  task: item.work || 'Task',
                  billableType: category.category === 'Project' ? 'Billable' : 'Non Billable',
                  status: item.dailyStatus?.[dayIndex] || timesheet.status,
                  dailyStatus: item.dailyStatus || [], // Include full daily status array
                  plannedHours: 0, // Not available in current structure
                  hoursSpent: parseFloat(hours) || 0,
                  description: item.descriptions?.[dayIndex] || '',
                  employee: timesheet.userId ? {
                    _id: timesheet.userId._id,
                    firstName: timesheet.userId.firstName,
                    lastName: timesheet.userId.lastName,
                    email: timesheet.userId.email,
                    contactNumber: timesheet.userId.contactNumber,
                    designation: timesheet.userId.designation,
                  } : undefined,
                });
              }
            });
          });
        });
      });
      
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

  return { rows, timesheets, isLoading, error, refresh: fetchData };
};
