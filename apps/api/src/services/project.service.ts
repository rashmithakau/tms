import { CONFLICT, INTERNAL_SERVER_ERROR } from '../constants/http';
import appAssert from '../utils/appAssert';
import ProjectModel from '../models/project.model';
import mongoose from 'mongoose';
import UserModel from '../models/user.model';
import { UserRole } from '@tms/shared';

export type CreateProjectParams = {
  projectName: string;
  billable: boolean;
  employees?: string[];
  supervisor?: string | null;
  status?: boolean;
};

export const createProject = async (data: CreateProjectParams) => {
  const existingProject = await ProjectModel.exists({
    projectName: data.projectName,
  });

  appAssert(!existingProject, CONFLICT, 'Project already exists');

  const project = await ProjectModel.create({
    projectName: data.projectName,
    billable: data.billable,
    employees: (data.employees ?? [])
      .filter((id) => !!id)
      .map((id) => new mongoose.Types.ObjectId(id)),
    supervisor:
      data.supervisor && data.supervisor.trim() !== ''
        ? new mongoose.Types.ObjectId(data.supervisor)
        : null,
    status: data.status ?? true,
  });

  appAssert(project, INTERNAL_SERVER_ERROR, 'Project creation failed');

  // If a supervisor is assigned on creation, set their role to Supervisor
  if (project.supervisor) {
    await UserModel.findByIdAndUpdate(project.supervisor, {
      $set: { role: UserRole.Supervisor },
    });
  }

  return {
    project,
  };
};

export const listProjects = async (userId: string, userRole: UserRole) => {
  switch (userRole) {
    case UserRole.Emp:
    case UserRole.Supervisor: {
      const projects = await ProjectModel.find({ status: true, employees: userId })
        .sort({ createdAt: -1 })
        .populate({ path: 'employees', select: 'firstName lastName email designation' })
        .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
      return { projects };
    }
    case UserRole.Admin:
    case UserRole.SuperAdmin: {
      const projects = await ProjectModel.find({ status: true })
        .sort({ createdAt: -1 })
        .populate({ path: 'employees', select: 'firstName lastName email designation' })
        .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
      return { projects };
    }
    default:
      return { projects: [] };
  }
};

export const updateProjectStaff = async (
  projectId: string,
  data: { employees?: string[]; supervisor?: string | null }
) => {
  //get the previous supervisor
  const existing = await ProjectModel.findById(projectId).select('supervisor');
  const update: any = {};
  if (Array.isArray(data.employees)) {
    update.employees = data.employees
      .filter((id) => !!id)
      .map((id) => new mongoose.Types.ObjectId(id));
  }
  if (data.supervisor !== undefined) {
    update.supervisor = data.supervisor
      ? new mongoose.Types.ObjectId(data.supervisor)
      : null;
  }
  const project = await ProjectModel.findByIdAndUpdate(
    projectId,
    { $set: update },
    { new: true }
  )
    .populate({ path: 'employees', select: 'firstName lastName email' })
    .populate({ path: 'supervisor', select: 'firstName lastName email' });
  appAssert(project, INTERNAL_SERVER_ERROR, 'Project update failed');

  // Update roles based on supervisor change
  if (data.supervisor !== undefined) {
    const previousSupervisorId = existing?.supervisor?.toString() || null;
    const newSupervisorId = project.supervisor
      ? (project.supervisor as any)._id?.toString?.() || project.supervisor.toString()
      : null;

    // Promote new supervisor if changed
    if (newSupervisorId && previousSupervisorId !== newSupervisorId) {
      await UserModel.findByIdAndUpdate(newSupervisorId, {
        $set: { role: UserRole.Supervisor },
      });
    }
    //previous supervisor if changed or removed and not supervising any other active project  
    if (
      previousSupervisorId &&
      (previousSupervisorId !== newSupervisorId || !newSupervisorId)
    ) {
      const stillSupervisingAnother = await ProjectModel.exists({
        _id: { $ne: projectId },
        supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
        status: true,
      });
      if (!stillSupervisingAnother) {
        await UserModel.findByIdAndUpdate(previousSupervisorId, {
          $set: { role: UserRole.Emp },
        });
      }
    }
  }
  return { project };
};

export const softDeleteProject = async (projectId: string) => {
  // Capture the current supervisor before deletion
  const existing = await ProjectModel.findById(projectId).select('supervisor');

  const project = await ProjectModel.findByIdAndUpdate(
    projectId,
    { $set: { status: false } },
    { new: true }
  );
  appAssert(project, INTERNAL_SERVER_ERROR, 'Project delete failed');

  // If there was a supervisor, check if they still supervise any other active projects
  const supervisorId = existing?.supervisor?.toString();
  if (supervisorId) {
    const stillSupervising = await ProjectModel.exists({
      _id: { $ne: projectId as any },
      supervisor: new mongoose.Types.ObjectId(supervisorId),
      status: true,
    });
    if (!stillSupervising) {
      await UserModel.findByIdAndUpdate(supervisorId, {
        $set: { role: UserRole.Emp },
      });
    }
  }

  return { projectId };
};

export const listSupervisedProjects = async (supervisorId: string) => {
  const projects = await ProjectModel.find({ 
    supervisor: supervisorId, 
    status: true 
  })
    .select('_id projectName')
    .sort({ projectName: 1 });
  
  return { projects };
};
