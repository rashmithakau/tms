import API from '../config/apiClient';
import { CreateProjectPayload } from '../interfaces';

export const listProjects = async () => {
  return API.get('/project');
};

export const listMyProjects = async () => {
  return API.get('/project/my-projects');
};

export const listSupervisedProjects = async () => {
  return API.get('/project/supervised');
};

export const createProject = async (data: CreateProjectPayload) => {
  return API.post('/project', data);
};

export const updateProjectStaff = async (
  projectId: string,
  data: { employees?: string[]; supervisor?: string | null }
) => {
  return API.put(`/api/project/${projectId}/staff`, data);
};

export const deleteProject = async (projectId: string) => {
  return API.delete(`/api/project/${projectId}`);
};



