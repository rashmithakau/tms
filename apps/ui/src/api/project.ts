import API from '../config/apiClient';
import { ProjectListItem, CreateProjectPayload } from '../interfaces';

export const listProjects = async () => {
  return API.get('/api/project');
};

export const listMyProjects = async () => {
  return API.get('/api/project/my-projects');
};

export const createProject = async (data: CreateProjectPayload) => {
  return API.post('/api/project', data);
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



