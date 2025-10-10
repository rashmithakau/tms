import { useState, useEffect, useCallback } from 'react';
import { listSupervisedTimesheets, getSupervisedProjects, getSupervisedTeams } from '../../api/timesheet';
import { getAllSupervisedTeams } from '../../api/team';
import { Timesheet } from '../../interfaces';
import { ITimeSheetRow } from '../../interfaces/entity/ITimeSheetRow';
import { SupervisedTimesheetsReturn } from '../../interfaces/hooks/timesheet';

export const useSupervisedTimesheets = (): SupervisedTimesheetsReturn => {
  const [rows, setRows] = useState<ITimeSheetRow[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]); 
  const [supervisedProjectIds, setSupervisedProjectIds] = useState<string[]>([]);
  const [supervisedTeamIds, setSupervisedTeamIds] = useState<string[]>([]);
  const [supervisedUserIds, setSupervisedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      
      const [timesheetsResp, projectsResp, teamsResp, allTeamsResp] = await Promise.all([
        listSupervisedTimesheets(),
        getSupervisedProjects(),
        getSupervisedTeams(),
        getAllSupervisedTeams()
      ]);
      
      const data = timesheetsResp.data?.timesheets || [];
      const supervisedProjects = projectsResp.data?.projects || [];
      const supervisedTeams = teamsResp.data?.teams || [];
      const allSupervisedTeams = allTeamsResp.data?.teams || [];
      

      setTimesheets(data);
 
      setSupervisedProjectIds(supervisedProjects.map(p => p._id));
      setSupervisedTeamIds(supervisedTeams.map(t => t._id));
      
      // Extract all user IDs from ALL supervised teams (including non-departments)
      const userIdsFromTeams = allSupervisedTeams.flatMap(team => 
        team.members?.map(m => m._id) || []
      );
      setSupervisedUserIds(Array.from(new Set(userIdsFromTeams)));
      

      const mapped: ITimeSheetRow[] = [];
      
      data.forEach((timesheet: any) => {
        const weekStartDate = new Date(timesheet.weekStartDate);
        
  
        timesheet.data?.forEach((category: any) => {
   
          category.items?.forEach((item: any) => {

            item.hours?.forEach((hours: string, dayIndex: number) => {
              if (hours && hours !== '0' && hours !== '0.00' && hours.trim() !== '') {
           
                const itemDate = new Date(weekStartDate);
                itemDate.setUTCDate(itemDate.getUTCDate() + dayIndex);
                
                mapped.push({
                  _id: `${timesheet._id}-${category.category}-${item.work || item.projectId || 'item'}-${dayIndex}`,
                  date: itemDate.toISOString().split('T')[0], 
                  projectId: item.projectId || '',
                  projectName: (item as any).projectName || item.work || 'Unknown',
                  task: item.work || 'Task',
                  billableType: category.category === 'Project' ? 'Billable' : 'Non Billable',
                  status: item.dailyStatus?.[dayIndex] || timesheet.status,
                  dailyStatus: item.dailyStatus || [], 
                  plannedHours: 0,
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

  return { rows, timesheets, supervisedProjectIds, supervisedTeamIds, supervisedUserIds, isLoading, error, refresh: fetchData };
};
