import { UserFilterType } from '../../../interfaces/report/filter';
import { TeamListItem } from '../../../interfaces/api';
import { ProjectListItem } from '../../../interfaces/api';



export interface UseUserFilterTypeReturn {
  userFilterType: UserFilterType;
  setUserFilterType: React.Dispatch<React.SetStateAction<UserFilterType>>;
  availableFilterOptions: UserFilterType[];
  teams: TeamListItem[];
  selectedTeamId: string;
  setSelectedTeamId: React.Dispatch<React.SetStateAction<string>>;
  isLoadingTeams: boolean;
  projects: ProjectListItem[];
  selectedProjectId: string;
  setSelectedProjectId: React.Dispatch<React.SetStateAction<string>>;
  isLoadingProjects: boolean;
  resetFilterType: () => void;
}