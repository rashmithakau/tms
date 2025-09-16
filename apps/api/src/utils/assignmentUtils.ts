import ProjectModel from '../models/project.model';
import TeamModel from '../models/team.model';
import mongoose from 'mongoose';

/**
 * Checks if an employee is assigned to any active project or team
 */
export const isEmployeeAssignedToProjectOrTeam = async (userId: string): Promise<boolean> => {
  try {
    // Check if assigned to any project as employee
    const assignedToProject = await ProjectModel.findOne({
      employees: userId,
      status: true,
    });

    if (assignedToProject) return true;

    // Check if assigned to any team as member
    const assignedToTeam = await TeamModel.findOne({
      members: userId,
      status: true,
    });

    if (assignedToTeam) return true;

    // Check if supervisor of any team
    const supervisorOfTeam = await TeamModel.findOne({
      supervisor: userId,
      status: true,
    });

    if (supervisorOfTeam) return true;

    // Check if supervisor of any project
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

/**
 * Gets all supervised user IDs from both projects and teams
 */
export const getSupervisedUserIds = async (supervisorId: string): Promise<string[]> => {
  // Get supervised employees from Projects
  const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });
  const projectSupervisedUserIds = Array.from(
    new Set(
      supervisedProjects.flatMap(p => p.employees?.map(e => e.toString()) || [])
    )
  );

  // Get supervised employees from Teams
  const supervisedTeams = await TeamModel.find({ supervisor: supervisorId });
  const teamSupervisedUserIds = Array.from(
    new Set(
      supervisedTeams.flatMap(t => t.members?.map(m => m.toString()) || [])
    )
  );

  // Combine both project and team supervised users
  return Array.from(
    new Set([...projectSupervisedUserIds, ...teamSupervisedUserIds])
  );
};

/**
 * Updates user team memberships when teams are modified
 */
export const updateUserTeamMemberships = async (
  teamId: string, 
  newMembers: string[], 
  oldMembers: string[] = []
): Promise<void> => {
  const UserModel = (await import('../models/user.model')).default;
  
  // Convert to ObjectId for comparison
  const teamObjectId = new mongoose.Types.ObjectId(teamId);
  
  // Members to add
  const membersToAdd = newMembers.filter(id => !oldMembers.includes(id));
  if (membersToAdd.length > 0) {
    await UserModel.updateMany(
      { _id: { $in: membersToAdd.map(id => new mongoose.Types.ObjectId(id)) } },
      { $addToSet: { teams: teamObjectId } }
    );
  }

  // Members to remove
  const membersToRemove = oldMembers.filter(id => !newMembers.includes(id));
  if (membersToRemove.length > 0) {
    await UserModel.updateMany(
      { _id: { $in: membersToRemove.map(id => new mongoose.Types.ObjectId(id)) } },
      { $pull: { teams: teamObjectId } }
    );
  }
};
