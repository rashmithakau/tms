export interface DashboardStats {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    totalAdmins: number;
  };
  projectStats: {
    totalProjects: number;
    activeProjects: number;
  };
  teamStats: {
    totalTeams: number;
  };
  timesheetStats: {
    draftCount: number;
    submittedCount: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    lateCount: number;
  };
}

export interface RejectedTimesheet {
  id: string;
  employeeName: string;
  employeeEmail: string;
  projectName: string;
  weekPeriod: string;
  rejectionReason: string;
  rejectedDate: string;
}

export interface TimesheetRejectionReason {
  reason: string;
}
