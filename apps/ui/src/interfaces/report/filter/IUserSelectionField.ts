import { UserFilterType} from '.';
import { Employee } from '../../api';

export interface ProjectTeamItem {
  _id: string;
  name: string;
  userCount: number;
  supervisor?: string; 
}

export interface ProjectTeamSelectProps {
  items: ProjectTeamItem[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  label: string;
  placeholder: string;
}

export interface UserSelectionFieldProps {
  filterType: UserFilterType;
  // Individual selection props
  employees?: Employee[];
  selectedEmployeeIds?: string[];
  onEmployeeChange?: (ids: string[]) => void;
  // Team selection props
  teams?: ProjectTeamItem[];
  selectedTeamId?: string;
  onTeamChange?: (id: string) => void;
  isLoadingTeams?: boolean;
  // Project selection props
  projects?: ProjectTeamItem[];
  selectedProjectId?: string;
  onProjectChange?: (id: string) => void;
  isLoadingProjects?: boolean;
  // Common props
  disabled?: boolean;
  showHelperText?: boolean;
}
