export interface IAdminStatsOverviewProps {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    totalAdmins: number;
  };
  projectStats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
  };
  timesheetStats: {
    pendingApprovals: number;
    approvedThisWeek: number;
    totalHoursLogged: number;
  };
  teamStats: {
    totalTeams: number;
  };
}
