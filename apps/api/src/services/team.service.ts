import { CONFLICT, INTERNAL_SERVER_ERROR } from '../constants/http';
import { appAssert } from '../utils/validation';
import mongoose from 'mongoose';
import TeamModel from '../models/team.model';
import ProjectModel from '../models/project.model';
import UserModel from '../models/user.model';
import { UserRole } from '@tms/shared';
import { stringArrayToObjectIds, stringToObjectId, filterValidIds } from '../utils/data';
import { updateUserRoleOnSupervisorAssignment, checkAndDowngradeUserRole } from '../utils/auth';
import { updateUserTeamMemberships } from '../utils/data';
import { CreateTeamParams } from '../interfaces/team';

export const createTeam = async (data: CreateTeamParams) => {
  
  
  const exists = await TeamModel.exists({ teamName: data.teamName });
  appAssert(!exists, CONFLICT, 'Team already exists');

  // Validate that all member IDs are valid MongoDB ObjectIds
  const memberIds = filterValidIds(data.members ?? []);
  const validMemberIds = memberIds.filter(id => mongoose.Types.ObjectId.isValid(id));
  
  if (memberIds.length !== validMemberIds.length) {
    console.warn('Some member IDs are invalid MongoDB ObjectIds:', {
      original: memberIds,
      valid: validMemberIds
    });
  }

  // Validate supervisor ID if provided
  if (data.supervisor && !mongoose.Types.ObjectId.isValid(data.supervisor)) {
   
    throw new Error('Invalid supervisor ID');
  }

  const team = await TeamModel.create({
    teamName: data.teamName,
    members: stringArrayToObjectIds(validMemberIds),
    supervisor: stringToObjectId(data.supervisor),
    status: data.status ?? true,
  });

  appAssert(team, INTERNAL_SERVER_ERROR, 'Team creation failed');

 

  try {
    // Update supervisor role if supervisor is assigned
    if (team.supervisor) {
      
      await updateUserRoleOnSupervisorAssignment(team.supervisor.toString());
    }

    // Update user team memberships if members are assigned
    if (validMemberIds.length > 0) {
      
      await updateUserTeamMemberships(team._id.toString(), validMemberIds);
    }
  } catch (error) {
    
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

export const listTeamsForUser = async (userId: string, userRole: UserRole) => {
  switch (userRole) {
    case UserRole.Emp:
    case UserRole.Supervisor: {
      const teams = await TeamModel.find({ status: true, members: userId })
        .sort({ createdAt: -1 })
        .populate({ path: 'members', select: 'firstName lastName email designation' })
        .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
      return { teams };
    }
    case UserRole.Admin:
    case UserRole.SupervisorAdmin:
    case UserRole.SuperAdmin: {
      const teams = await TeamModel.find({ status: true })
        .sort({ createdAt: -1 })
        .populate({ path: 'members', select: 'firstName lastName email designation' })
        .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
      return { teams };
    }
    default:
      return { teams: [] };
  }
};

export const listMyMemberTeams = async (userId: string) => {
  const teams = await TeamModel.find({ status: true, members: userId })
    .sort({ createdAt: -1 })
    .populate({ path: 'members', select: 'firstName lastName email designation' })
    .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
  return { teams };
};

export const listSupervisedTeams = async (supervisorId: string) => {
  const teams = await TeamModel.find({ 
    supervisor: supervisorId, 
    status: true 
  })
    .select('_id teamName')
    .sort({ teamName: 1 });
  
  return { teams };
};

export const updateTeamStaff = async (
  teamId: string,
  data: { members?: string[]; supervisor?: string | null }
) => {
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

  if (data.supervisor !== undefined) {
    const previousSupervisorId = existing?.supervisor?.toString() || null;
    const newSupervisorId = team.supervisor
      ? (team.supervisor as any)._id?.toString?.() || team.supervisor.toString()
      : null;

    if (newSupervisorId && previousSupervisorId !== newSupervisorId) {
      const sup = await UserModel.findById(newSupervisorId).select('role');
      if (sup) {
        if (sup.role === UserRole.Admin) {
          await UserModel.findByIdAndUpdate(newSupervisorId, {
            $set: { role: UserRole.SupervisorAdmin },
          });
        } else if (sup.role === UserRole.Emp) {
          await UserModel.findByIdAndUpdate(newSupervisorId, {
            $set: { role: UserRole.Supervisor },
          });
        }
      }
    }
    
    if (
      previousSupervisorId &&
      (previousSupervisorId !== newSupervisorId || !newSupervisorId)
    ) {
      const prev = await UserModel.findById(previousSupervisorId).select('role');
      
      if (prev) {
        if (prev.role === UserRole.SupervisorAdmin) {
          const stillSupervisingAnotherTeam = await TeamModel.exists({
            _id: { $ne: teamId },
            supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
            status: true,
          });
          
          if (!stillSupervisingAnotherTeam) {
            await UserModel.findByIdAndUpdate(previousSupervisorId, {
              $set: { role: UserRole.Admin },
            });
          }
        } else if (prev.role === UserRole.Supervisor) {
          const stillSupervisingAnotherTeam = await TeamModel.exists({
            _id: { $ne: teamId },
            supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
            status: true,
          });
          
          const stillSupervisingAnotherProject = await ProjectModel.exists({
            supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
            status: true,
          });
          
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
  const existing = await TeamModel.findById(teamId).select('supervisor members');

  const team = await TeamModel.findByIdAndUpdate(
    teamId,
    { $set: { status: false } },
    { new: true }
  );
  appAssert(team, INTERNAL_SERVER_ERROR, 'Team delete failed');

  const supervisorId = existing?.supervisor?.toString();
  if (supervisorId) {
    const prev = await UserModel.findById(supervisorId).select('role');
    
    if (prev) {
      if (prev.role === UserRole.SupervisorAdmin) {
        const stillSupervisingAnotherTeam = await TeamModel.exists({
          _id: { $ne: teamId },
          supervisor: new mongoose.Types.ObjectId(supervisorId),
          status: true,
        });
        
        if (!stillSupervisingAnotherTeam) {
          await UserModel.findByIdAndUpdate(supervisorId, {
            $set: { role: UserRole.Admin },
          });
        }
      } else if (prev.role === UserRole.Supervisor) {
        const stillSupervisingAnotherTeam = await TeamModel.exists({
          _id: { $ne: teamId },
          supervisor: new mongoose.Types.ObjectId(supervisorId),
          status: true,
        });
        
        const stillSupervisingAnotherProject = await ProjectModel.exists({
          supervisor: new mongoose.Types.ObjectId(supervisorId),
          status: true,
        });
        
        if (!stillSupervisingAnotherTeam && !stillSupervisingAnotherProject) {
          await UserModel.findByIdAndUpdate(supervisorId, {
            $set: { role: UserRole.Emp },
          });
        }
      }
    }
  }

  if (existing?.members && existing.members.length > 0) {
    await UserModel.updateMany(
      { _id: { $in: existing.members } },
      { $pull: { teams: new mongoose.Types.ObjectId(teamId) } }
    );
  }

  return { teamId };
};


