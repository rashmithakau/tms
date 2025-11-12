// Export all API modules
// Note: Some modules may have duplicate exports, import directly from specific files if needed
export * from './auth';
export * from './dashboard';
export * from './history';
export * from './notification';
export * from './report';

// Export specific functions to avoid naming conflicts
export {
  listProjects,
  listMyProjects,
  listSupervisedProjects,
  createProject,
  updateProjectStaff,
  deleteProject,
} from './project';

export {
  listTeams,
  listMyTeams,
  listMyMemberTeams,
  createTeam,
  updateTeamStaff,
  deleteTeam,
  getSupervisedTeams as getTeamsSupervisedByUser,
  getAllSupervisedTeams,
} from './team';

export * from './timesheet';
export * from './user';

// Re-export commonly used types from interfaces
export type { ReportFilter } from '../interfaces/api';
