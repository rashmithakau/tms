import API from '../config/apiClient';
import { CreateTeamPayload } from '../interfaces';

export const createTeam = async (payload: CreateTeamPayload) => {
  const res = await API.post('/api/team', payload);
  return res.data;
};

export const listTeams = async () => {
  const res = await API.get('/api/team');
  return res;
};

export const listMyTeams = async () => {
  const res = await API.get('/api/team/my-teams');
  return res;
};

export const listMyMemberTeams = async () => {
  const res = await API.get('/api/team/my-member-teams');
  return res;
};

export const getSupervisedTeams = async () => {
  return API.get<{ teams: Array<{ _id: string; teamName: string }> }>('/api/team/supervised');
};

export const updateTeamStaff = async (
  teamId: string,
  data: { members?: string[]; supervisor?: string | null }
) => {
  return API.put(`/api/team/${teamId}/staff`, data);
};

export const deleteTeam = async (teamId: string) => {
  return API.delete(`/api/team/${teamId}`);
};


