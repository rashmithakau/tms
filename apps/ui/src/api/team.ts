import API from '../config/apiClient';

export type CreateTeamPayload = {
  teamName: string;
  employees: string[];
  supervisor: string | null;
};

export const createTeam = async (payload: CreateTeamPayload) => {
  const res = await API.post('/api/team', payload);
  return res.data;
};

export type TeamListItem = {
  _id: string;
  teamName: string;
  createdAt: string;
  members: Array<{ _id: string; firstName: string; lastName: string; email?: string; designation?: string }>;
  supervisor: { _id: string; firstName: string; lastName: string; email?: string; designation?: string } | null;
};

export const listTeams = async () => {
  const res = await API.get('/api/team');
  return res;
};

export const listMyTeams = async () => {
  const res = await API.get('/api/team/my-teams');
  return res;
};

export const updateTeamStaff = async (
  teamId: string,
  data: { members?: string[]; supervisor?: string | null }
) => {
  return API.put(`/api/team/${teamId}/staff`, data);
};


