import { CONFLICT, INTERNAL_SERVER_ERROR } from '../constants/http';
import appAssert from '../utils/appAssert';
import ProjectModel from '../models/project.model';

export type CreateProjectParams = {
  projectName: string;
  billable: boolean;
  timeSheets: boolean;
  isScrumProject: boolean;
};

export const createProject = async (data: CreateProjectParams) => {
  const existingProject = await ProjectModel.exists({
    projectName: data.projectName,
  });

  appAssert(!existingProject, CONFLICT, 'Project already exists');

  const project = await ProjectModel.create({
    projectName: data.projectName,
    billable: data.billable,
    timeSheets: data.timeSheets,
    isScrumProject: data.isScrumProject,
  });

  appAssert(project, INTERNAL_SERVER_ERROR, 'Project creation failed');

  return {
    project
  };
};
