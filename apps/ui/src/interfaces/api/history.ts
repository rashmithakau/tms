export enum HistoryActionType {
  // User actions
  USER_CREATED = 'USER_CREATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  USER_REACTIVATED = 'USER_REACTIVATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  
  // Project actions
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_SUPERVISOR_ASSIGNED = 'PROJECT_SUPERVISOR_ASSIGNED',
  PROJECT_SUPERVISOR_CHANGED = 'PROJECT_SUPERVISOR_CHANGED',
  PROJECT_EMPLOYEE_ADDED = 'PROJECT_EMPLOYEE_ADDED',
  PROJECT_EMPLOYEE_REMOVED = 'PROJECT_EMPLOYEE_REMOVED',
  PROJECT_DELETED = 'PROJECT_DELETED',
  PROJECT_RESTORED = 'PROJECT_RESTORED',
  
  // Team actions
  TEAM_CREATED = 'TEAM_CREATED',
  TEAM_SUPERVISOR_ASSIGNED = 'TEAM_SUPERVISOR_ASSIGNED',
  TEAM_SUPERVISOR_CHANGED = 'TEAM_SUPERVISOR_CHANGED',
  TEAM_MEMBER_ADDED = 'TEAM_MEMBER_ADDED',
  TEAM_MEMBER_REMOVED = 'TEAM_MEMBER_REMOVED',
  TEAM_DELETED = 'TEAM_DELETED',
}

export interface HistoryRecord {
  _id: string;
  actionType: HistoryActionType;
  performedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  targetEntity: {
    type: 'User' | 'Project' | 'Team';
    id: string;
    name: string;
  };
  affectedEntity?: {
    type: 'User' | 'Project' | 'Team';
    id: string;
    name: string;
  };
  description: string;
  metadata?: {
    oldValue?: any;
    newValue?: any;
    roleAssigned?: string;
    designation?: string;
    contactNumber?: string;
    [key: string]: any;
  };
  timestamp: string;
  createdAt: string;
}

export interface HistoryFilter {
  actionType?: HistoryActionType[];
  entityType?: ('User' | 'Project' | 'Team')[];
  performedBy?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface HistoryResponse {
  data: HistoryRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
