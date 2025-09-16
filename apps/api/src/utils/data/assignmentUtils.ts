import ProjectModel from '../../models/project.model';
import TeamModel from '../../models/team.model';
import mongoose from 'mongoose';

export const isEmployeeAssignedToProjectOrTeam = async (userId: string): Promise<boolean> => {
  try {
    const assignedToProject = await ProjectModel.findOne({
      employees: userId,
      status: true,
    });

    if (assignedToProject) return true;

    const assignedToTeam = await TeamModel.findOne({
      members: userId,
      status: true,
    });

    if (assignedToTeam) return true;

    const supervisorOfTeam = await TeamModel.findOne({
      supervisor: userId,
      status: true,
    });

    if (supervisorOfTeam) return true;

    const supervisorOfProject = await ProjectModel.findOne({
      supervisor: userId,
      status: true,
    });

    return !!supervisorOfProject;
  } catch (error) {
    console.error(`Error checking project/team assignment for user ${userId}:`, error);
    return false;
  }
};

export const getSupervisedUserIds = async (supervisorId: string): Promise<string[]> => {

  const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });
  const projectSupervisedUserIds = Array.from(
    new Set(
      supervisedProjects.flatMap(p => p.employees?.map(e => e.toString()) || [])
    )
  );

  const supervisedTeams = await TeamModel.find({ supervisor: supervisorId });
  const teamSupervisedUserIds = Array.from(
    new Set(
      supervisedTeams.flatMap(t => t.members?.map(m => m.toString()) || [])
    )
  );

  return Array.from(
    new Set([...projectSupervisedUserIds, ...teamSupervisedUserIds])
  );
};

export const updateUserTeamMemberships = async (
  teamId: string, 
  newMembers: string[], 
  oldMembers: string[] = []
): Promise<void> => {
  const UserModel = (await import('../../models/user.model')).default;
  
  const teamObjectId = new mongoose.Types.ObjectId(teamId);
  
  const membersToAdd = newMembers.filter(id => !oldMembers.includes(id));
  if (membersToAdd.length > 0) {
    await UserModel.updateMany(
      { _id: { $in: membersToAdd.map(id => new mongoose.Types.ObjectId(id)) } },
      { $addToSet: { teams: teamObjectId } }
    );
  }

  const membersToRemove = oldMembers.filter(id => !newMembers.includes(id));
  if (membersToRemove.length > 0) {
    await UserModel.updateMany(
      { _id: { $in: membersToRemove.map(id => new mongoose.Types.ObjectId(id)) } },
      { $pull: { teams: teamObjectId } }
    );
  }
};
