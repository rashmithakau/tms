import API from '../config/apiClient';

export type ProjectListItem = {
  _id: string;
  projectName: string;
  billable: boolean;
  employees: { _id: string; firstName: string; lastName: string; email: string; designation?: string }[];
  supervisor?: { _id: string; firstName: string; lastName: string; email: string; designation?: string } | null;
  createdAt?: string;
  status?: boolean;
};

export type CreateProjectPayload = {
  projectName: string;
  billable: 'yes' | 'no';
  employees: string[];
  supervisor?: string | null;
};

export const listProjects = async () => {
  return API.get('/api/project');
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



