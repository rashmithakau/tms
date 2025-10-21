import { useState, useEffect } from 'react';
import { UserFilterType, UseUserFilterTypeOptions } from '../../interfaces/report/filter';
import { TeamListItem } from '../../interfaces/api';
import { ProjectListItem } from '../../interfaces/api';
import { listTeams } from '../../api/team';
import { listProjects } from '../../api/project';
import { UserRole } from '@tms/shared';
import { UseUserFilterTypeReturn } from '../../interfaces/report/hook/IUseUserFilterTypeReturn';


export const useUserFilterType = ({ 
  userRole,
  canSeeAllData 
}: UseUserFilterTypeOptions): UseUserFilterTypeReturn => {
  const [userFilterType, setUserFilterType] = useState<UserFilterType>('' as UserFilterType);
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Determine available filter options based on user role
  const availableFilterOptions: UserFilterType[] = 
    userRole === UserRole.Admin || userRole === UserRole.SupervisorAdmin
      ? ['individual', 'team', 'project']
      : ['individual'];

  // Load teams and projects for Admin/SupervisorAdmin
  useEffect(() => {
    if (!canSeeAllData) return;

    const loadTeamsAndProjects = async () => {
      setIsLoadingTeams(true);
      setIsLoadingProjects(true);

      try {
        const [teamsResponse, projectsResponse] = await Promise.all([
          listTeams(),
          listProjects(),
        ]);

        setTeams(teamsResponse.data?.teams || []);
        setProjects(projectsResponse.data?.projects || []);
      } catch (error) {
        console.error('Failed to load teams and projects:', error);
        // Reset to empty arrays on error
        setTeams([]);
        setProjects([]);
      } finally {
        setIsLoadingTeams(false);
        setIsLoadingProjects(false);
      }
    };

    loadTeamsAndProjects();
  }, [canSeeAllData]);

  const resetFilterType = () => {
    setUserFilterType('' as UserFilterType);
    setSelectedTeamId('');
    setSelectedProjectId('');
  };

  return {
    userFilterType,
    setUserFilterType,
    availableFilterOptions,
    teams,
    selectedTeamId,
    setSelectedTeamId,
    isLoadingTeams,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    isLoadingProjects,
    resetFilterType,
  };
};
