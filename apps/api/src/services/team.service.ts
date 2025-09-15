import { CONFLICT, INTERNAL_SERVER_ERROR } from '../constants/http';
import appAssert from '../utils/appAssert';
import mongoose from 'mongoose';
import TeamModel from '../models/team.model';
import ProjectModel from '../models/project.model';
import UserModel from '../models/user.model';
import { UserRole } from '@tms/shared';

export type CreateTeamParams = {
  teamName: string;
  members?: string[];
  supervisor?: string | null;
  status?: boolean;
};

export const createTeam = async (data: CreateTeamParams) => {
  const exists = await TeamModel.exists({ teamName: data.teamName });
  appAssert(!exists, CONFLICT, 'Team already exists');

  const team = await TeamModel.create({
    teamName: data.teamName,
    members: (data.members ?? [])
      .filter((id) => !!id)
      .map((id) => new mongoose.Types.ObjectId(id)),
    supervisor:
      data.supervisor && data.supervisor.trim() !== ''
        ? new mongoose.Types.ObjectId(data.supervisor)
        : null,
    status: data.status ?? true,
  });

  appAssert(team, INTERNAL_SERVER_ERROR, 'Team creation failed');


  if (team.supervisor) {
    const sup = await UserModel.findById(team.supervisor).select('role');
    if (sup) {
      if (sup.role === UserRole.Admin) {
        // Admin -> SupervisorAdmin when assigned as team supervisor
        await UserModel.findByIdAndUpdate(team.supervisor, {
          $set: { role: UserRole.SupervisorAdmin },
        });
      } else if (sup.role === UserRole.Emp) {
        // Emp -> Supervisor when assigned as team supervisor
        await UserModel.findByIdAndUpdate(team.supervisor, {
          $set: { role: UserRole.Supervisor },
        });
      }
      // If already SupervisorAdmin or Supervisor, keep current role
    }
  }

  if ((data.members ?? []).length > 0) {
    await UserModel.updateMany(
      { _id: { $in: (data.members ?? []).map((id) => new mongoose.Types.ObjectId(id)) } },
      { $addToSet: { teams: team._id } }
    );
  }

  return { team };
};

export const listTeams = async () => {
  const teams = await TeamModel.find({ status: true })
    .sort({ createdAt: -1 })
    .populate({ path: 'members', select: 'firstName lastName email designation' })
    .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
  return { teams };
};

export const updateTeamStaff = async (
  teamId: string,
  data: { members?: string[]; supervisor?: string | null }
) => {
  // Get the previous supervisor
  const existing = await TeamModel.findById(teamId).select('supervisor');
  const update: any = {};
  
  if (Array.isArray(data.members)) {
    update.members = data.members
      .filter((id) => !!id)
      .map((id) => new mongoose.Types.ObjectId(id));
  }
  
  if (data.supervisor !== undefined) {
    update.supervisor = data.supervisor
      ? new mongoose.Types.ObjectId(data.supervisor)
      : null;
  }
  
  const team = await TeamModel.findByIdAndUpdate(
    teamId,
    { $set: update },
    { new: true }
  )
    .populate({ path: 'members', select: 'firstName lastName email designation' })
    .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
    
  appAssert(team, INTERNAL_SERVER_ERROR, 'Team update failed');

  // Update roles based on supervisor change
  if (data.supervisor !== undefined) {
    const previousSupervisorId = existing?.supervisor?.toString() || null;
    const newSupervisorId = team.supervisor
      ? (team.supervisor as any)._id?.toString?.() || team.supervisor.toString()
      : null;

    // Promote new supervisor if changed
    if (newSupervisorId && previousSupervisorId !== newSupervisorId) {
      const sup = await UserModel.findById(newSupervisorId).select('role');
      if (sup) {
        if (sup.role === UserRole.Admin) {
          // Admin -> SupervisorAdmin when assigned as team supervisor
          await UserModel.findByIdAndUpdate(newSupervisorId, {
            $set: { role: UserRole.SupervisorAdmin },
          });
        } else if (sup.role === UserRole.Emp) {
          // Emp -> Supervisor when assigned as team supervisor
          await UserModel.findByIdAndUpdate(newSupervisorId, {
            $set: { role: UserRole.Supervisor },
          });
        }
        // If already SupervisorAdmin or Supervisor, keep current role
      }
    }
    
    // Demote previous supervisor if changed or removed
    if (
      previousSupervisorId &&
      (previousSupervisorId !== newSupervisorId || !newSupervisorId)
    ) {
      const prev = await UserModel.findById(previousSupervisorId).select('role');
      
      if (prev) {
        if (prev.role === UserRole.SupervisorAdmin) {
          // For SupervisorAdmin: check if still supervising any other teams
          const stillSupervisingAnotherTeam = await TeamModel.exists({
            _id: { $ne: teamId },
            supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
            status: true,
          });
          
          // Only demote to Admin if not supervising any other teams
          if (!stillSupervisingAnotherTeam) {
            await UserModel.findByIdAndUpdate(previousSupervisorId, {
              $set: { role: UserRole.Admin },
            });
          }
        } else if (prev.role === UserRole.Supervisor) {
          // For Supervisor: check if still supervising any other teams or projects
          const stillSupervisingAnotherTeam = await TeamModel.exists({
            _id: { $ne: teamId },
            supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
            status: true,
          });
          
          const stillSupervisingAnotherProject = await ProjectModel.exists({
            supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
            status: true,
          });
          
          // Only demote to Emp if not supervising any other teams or projects
          if (!stillSupervisingAnotherTeam && !stillSupervisingAnotherProject) {
            await UserModel.findByIdAndUpdate(previousSupervisorId, {
              $set: { role: UserRole.Emp },
            });
          }
        }
      }
    }
  }
  
  return { team };
};

export const softDeleteTeam = async (teamId: string) => {
  // Capture the current team data before deletion
  const existing = await TeamModel.findById(teamId).select('supervisor members');

  const team = await TeamModel.findByIdAndUpdate(
    teamId,
    { $set: { status: false } },
    { new: true }
  );
  appAssert(team, INTERNAL_SERVER_ERROR, 'Team delete failed');

  // Handle supervisor role management
  const supervisorId = existing?.supervisor?.toString();
  if (supervisorId) {
    const prev = await UserModel.findById(supervisorId).select('role');
    
    if (prev) {
      if (prev.role === UserRole.SupervisorAdmin) {
        // For SupervisorAdmin: check if still supervising any other teams
        const stillSupervisingAnotherTeam = await TeamModel.exists({
          _id: { $ne: teamId },
          supervisor: new mongoose.Types.ObjectId(supervisorId),
          status: true,
        });
        
        // Only demote to Admin if not supervising any other teams
        if (!stillSupervisingAnotherTeam) {
          await UserModel.findByIdAndUpdate(supervisorId, {
            $set: { role: UserRole.Admin },
          });
        }
      } else if (prev.role === UserRole.Supervisor) {
        // For Supervisor: check if still supervising any other teams or projects
        const stillSupervisingAnotherTeam = await TeamModel.exists({
          _id: { $ne: teamId },
          supervisor: new mongoose.Types.ObjectId(supervisorId),
          status: true,
        });
        
        const stillSupervisingAnotherProject = await ProjectModel.exists({
          supervisor: new mongoose.Types.ObjectId(supervisorId),
          status: true,
        });
        
        // Only demote to Emp if not supervising any other teams or projects
        if (!stillSupervisingAnotherTeam && !stillSupervisingAnotherProject) {
          await UserModel.findByIdAndUpdate(supervisorId, {
            $set: { role: UserRole.Emp },
          });
        }
      }
    }
  }

  // Remove team from all users' teams array
  if (existing?.members && existing.members.length > 0) {
    await UserModel.updateMany(
      { _id: { $in: existing.members } },
      { $pull: { teams: new mongoose.Types.ObjectId(teamId) } }
    );
  }

  return { teamId };
};


