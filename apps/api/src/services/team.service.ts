import { CONFLICT, INTERNAL_SERVER_ERROR } from '../constants/http';
import appAssert from '../utils/appAssert';
import mongoose from 'mongoose';
import TeamModel from '../models/team.model';
import UserModel from '../models/user.model';

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

  // Update users to include this team in their teams array
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


