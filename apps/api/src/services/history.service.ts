import History from '../models/history.model';
import { HistoryActionType } from '../constants/historyActionType';

export class HistoryService {
  static async log(data: {
    actionType: HistoryActionType;
    performedBy: string;
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
    metadata?: any;
  }): Promise<void> {
    try {
      await History.create({
        ...data,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error logging history:', error);
    }
  }

  // User actions
  static async logUserCreated(
    performedBy: string,
    createdUser: { id: string; name: string; role: string }
  ) {
    await this.log({
      actionType: HistoryActionType.USER_CREATED,
      performedBy,
      targetEntity: {
        type: 'User',
        id: createdUser.id,
        name: createdUser.name,
      },
      description: `Created user ${createdUser.name} with role ${createdUser.role}`,
      metadata: { roleAssigned: createdUser.role },
    });
  }

  static async logUserDeactivated(
    performedBy: string,
    deactivatedUser: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.USER_DEACTIVATED,
      performedBy,
      targetEntity: {
        type: 'User',
        id: deactivatedUser.id,
        name: deactivatedUser.name,
      },
      description: `Deactivated user ${deactivatedUser.name}`,
    });
  }

  static async logUserReactivated(
    performedBy: string,
    reactivatedUser: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.USER_REACTIVATED,
      performedBy,
      targetEntity: {
        type: 'User',
        id: reactivatedUser.id,
        name: reactivatedUser.name,
      },
      description: `Reactivated user ${reactivatedUser.name}`,
    });
  }

  static async logUserUpdated(
    performedBy: string,
    updatedUser: { id: string; name: string },
    changes: string
  ) {
    await this.log({
      actionType: HistoryActionType.USER_UPDATED,
      performedBy,
      targetEntity: {
        type: 'User',
        id: updatedUser.id,
        name: updatedUser.name,
      },
      description: `Updated user ${updatedUser.name}: ${changes}`,
    });
  }

  static async logUserRoleChanged(
    performedBy: string,
    user: { id: string; name: string },
    oldRole: string,
    newRole: string
  ) {
    await this.log({
      actionType: HistoryActionType.USER_ROLE_CHANGED,
      performedBy,
      targetEntity: {
        type: 'User',
        id: user.id,
        name: user.name,
      },
      description: `Changed role for ${user.name} from ${oldRole} to ${newRole}`,
      metadata: { oldValue: oldRole, newValue: newRole },
    });
  }

  // Project actions
  static async logProjectCreated(
    performedBy: string,
    project: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.PROJECT_CREATED,
      performedBy,
      targetEntity: {
        type: 'Project',
        id: project.id,
        name: project.name,
      },
      description: `Created project ${project.name}`,
    });
  }

  static async logProjectSupervisorAssigned(
    performedBy: string,
    project: { id: string; name: string },
    supervisor: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.PROJECT_SUPERVISOR_ASSIGNED,
      performedBy,
      targetEntity: {
        type: 'Project',
        id: project.id,
        name: project.name,
      },
      affectedEntity: {
        type: 'User',
        id: supervisor.id,
        name: supervisor.name,
      },
      description: `Assigned ${supervisor.name} as supervisor for project ${project.name}`,
    });
  }

  static async logProjectSupervisorChanged(
    performedBy: string,
    project: { id: string; name: string },
    oldSupervisor: { id: string; name: string },
    newSupervisor: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.PROJECT_SUPERVISOR_CHANGED,
      performedBy,
      targetEntity: {
        type: 'Project',
        id: project.id,
        name: project.name,
      },
      affectedEntity: {
        type: 'User',
        id: newSupervisor.id,
        name: newSupervisor.name,
      },
      description: `Changed supervisor for project ${project.name} from ${oldSupervisor.name} to ${newSupervisor.name}`,
      metadata: {
        oldValue: oldSupervisor.name,
        newValue: newSupervisor.name,
      },
    });
  }

  static async logProjectEmployeeAdded(
    performedBy: string,
    project: { id: string; name: string },
    employee: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.PROJECT_EMPLOYEE_ADDED,
      performedBy,
      targetEntity: {
        type: 'Project',
        id: project.id,
        name: project.name,
      },
      affectedEntity: {
        type: 'User',
        id: employee.id,
        name: employee.name,
      },
      description: `Added ${employee.name} to project ${project.name}`,
    });
  }

  static async logProjectEmployeeRemoved(
    performedBy: string,
    project: { id: string; name: string },
    employee: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.PROJECT_EMPLOYEE_REMOVED,
      performedBy,
      targetEntity: {
        type: 'Project',
        id: project.id,
        name: project.name,
      },
      affectedEntity: {
        type: 'User',
        id: employee.id,
        name: employee.name,
      },
      description: `Removed ${employee.name} from project ${project.name}`,
    });
  }

  static async logProjectDeleted(
    performedBy: string,
    project: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.PROJECT_DELETED,
      performedBy,
      targetEntity: {
        type: 'Project',
        id: project.id,
        name: project.name,
      },
      description: `Deleted project ${project.name}`,
    });
  }

  static async logProjectRestored(
    performedBy: string,
    project: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.PROJECT_RESTORED,
      performedBy,
      targetEntity: {
        type: 'Project',
        id: project.id,
        name: project.name,
      },
      description: `Restored project ${project.name}`,
    });
  }

  // Team actions
  static async logTeamCreated(
    performedBy: string,
    team: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.TEAM_CREATED,
      performedBy,
      targetEntity: {
        type: 'Team',
        id: team.id,
        name: team.name,
      },
      description: `Created team ${team.name}`,
    });
  }

  static async logTeamSupervisorAssigned(
    performedBy: string,
    team: { id: string; name: string },
    supervisor: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.TEAM_SUPERVISOR_ASSIGNED,
      performedBy,
      targetEntity: {
        type: 'Team',
        id: team.id,
        name: team.name,
      },
      affectedEntity: {
        type: 'User',
        id: supervisor.id,
        name: supervisor.name,
      },
      description: `Assigned ${supervisor.name} as supervisor for team ${team.name}`,
    });
  }

  static async logTeamSupervisorChanged(
    performedBy: string,
    team: { id: string; name: string },
    oldSupervisor: { id: string; name: string },
    newSupervisor: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.TEAM_SUPERVISOR_CHANGED,
      performedBy,
      targetEntity: {
        type: 'Team',
        id: team.id,
        name: team.name,
      },
      affectedEntity: {
        type: 'User',
        id: newSupervisor.id,
        name: newSupervisor.name,
      },
      description: `Changed supervisor for team ${team.name} from ${oldSupervisor.name} to ${newSupervisor.name}`,
      metadata: {
        oldValue: oldSupervisor.name,
        newValue: newSupervisor.name,
      },
    });
  }

  static async logTeamMemberAdded(
    performedBy: string,
    team: { id: string; name: string },
    member: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.TEAM_MEMBER_ADDED,
      performedBy,
      targetEntity: {
        type: 'Team',
        id: team.id,
        name: team.name,
      },
      affectedEntity: {
        type: 'User',
        id: member.id,
        name: member.name,
      },
      description: `Added ${member.name} to team ${team.name}`,
    });
  }

  static async logTeamMemberRemoved(
    performedBy: string,
    team: { id: string; name: string },
    member: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.TEAM_MEMBER_REMOVED,
      performedBy,
      targetEntity: {
        type: 'Team',
        id: team.id,
        name: team.name,
      },
      affectedEntity: {
        type: 'User',
        id: member.id,
        name: member.name,
      },
      description: `Removed ${member.name} from team ${team.name}`,
    });
  }

  static async logTeamDeleted(
    performedBy: string,
    team: { id: string; name: string }
  ) {
    await this.log({
      actionType: HistoryActionType.TEAM_DELETED,
      performedBy,
      targetEntity: {
        type: 'Team',
        id: team.id,
        name: team.name,
      },
      description: `Deleted team ${team.name}`,
    });
  }
}
