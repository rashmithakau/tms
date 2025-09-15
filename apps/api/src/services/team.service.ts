import { CONFLICT, INTERNAL_SERVER_ERROR } from '../constants/http';
import appAssert from '../utils/appAssert';
import mongoose from 'mongoose';
import TeamModel from '../models/team.model';
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
    if (sup && sup.role === UserRole.Admin) {
      await UserModel.findByIdAndUpdate(team.supervisor, {
        $set: { role: UserRole.SupervisorAdmin },
      });
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
  // Always return teams where the user is a member, regardless of role
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

    // Promote new supervisor if changed: only Admin -> SupervisorAdmin
    if (newSupervisorId && previousSupervisorId !== newSupervisorId) {
      const sup = await UserModel.findById(newSupervisorId).select('role');
      if (sup && sup.role === UserRole.Admin) {
        await UserModel.findByIdAndUpdate(newSupervisorId, {
          $set: { role: UserRole.SupervisorAdmin },
        });
      }
    }
    
    // Demote previous supervisor if changed or removed and not supervising any other active team
    if (
      previousSupervisorId &&
      (previousSupervisorId !== newSupervisorId || !newSupervisorId)
    ) {
      const stillSupervisingAnother = await TeamModel.exists({
        _id: { $ne: teamId },
        supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
        status: true,
      });
      if (!stillSupervisingAnother) {
        const prev = await UserModel.findById(previousSupervisorId).select('role');
        if (prev && prev.role === UserRole.SupervisorAdmin) {
          await UserModel.findByIdAndUpdate(previousSupervisorId, {
            $set: { role: UserRole.Admin },
          });
        }
      }
    }
  }
  
  return { team };
};


