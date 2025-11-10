import { useCallback, useEffect, useState } from 'react';
import { listMyTimesheets } from '../../api/timesheet';
import { ITimeSheetRow } from '../../interfaces/entity/ITimeSheetRow';
import { TimesheetStatus } from '@tms/shared';

export const useTimesheets = () => {
  const [rows, setRows] = useState<ITimeSheetRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const resp = await listMyTimesheets();
      const timesheets = resp.data?.timesheets || [];
      
      // Flatten weekly timesheets into individual daily entries
      const allRows: ITimeSheetRow[] = [];
      
      timesheets.forEach((timesheet: any) => {
        const weekStartDate = new Date(timesheet.weekStartDate);
        const categories = timesheet.data || [];
        
        categories.forEach((category: any) => {
          const items = category.items || [];
          
          items.forEach((item: any) => {
            const hours = item.hours || [];
            const descriptions = item.descriptions || [];
            const dailyStatus = item.dailyStatus || [];
            
            // Create a row for each day that has hours > 0
            hours.forEach((hourStr: string, dayIndex: number) => {
              const hoursSpent = parseFloat(hourStr || '0');
              
              // Only create row if there are hours logged
              if (hoursSpent > 0) {
                const entryDate = new Date(weekStartDate);
                entryDate.setDate(entryDate.getDate() + dayIndex);
                
                // Extract task from description or use a default
                const description = descriptions[dayIndex] || '';
                const taskTitle = description ? description.split('\n')[0] : 'Task'; // Use first line of description as task
                
                allRows.push({
                  _id: `${timesheet._id}-${category.category}-${items.indexOf(item)}-${dayIndex}`,
                  date: entryDate.toISOString(),
                  projectId: item.projectId || '',
                  projectName: item.work || 'Unknown',
                  task: taskTitle,
                  billableType: category.category === 'Project' ? 'Billable' : 'Non-Billable',
                  status: dailyStatus[dayIndex] || timesheet.status || TimesheetStatus.Draft,
                  plannedHours: 0,
                  hoursSpent: hoursSpent,
                  description: description,
                  // Store metadata for edit/delete operations
                  timesheetId: timesheet._id,
                  categoryIndex: categories.indexOf(category),
                  itemIndex: items.indexOf(item),
                  dayIndex: dayIndex,
                } as any);
              }
            });
          });
        });
      });
      
      // Sort by date descending (newest first)
      allRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setRows(allRows);
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



