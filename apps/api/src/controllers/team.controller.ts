import { CREATED, OK } from '../constants/http';
import catchErrors from '../utils/catchErrors';
import { createTeam, listTeams, updateTeamStaff } from '../services/team.service';

export const createTeamHandler = catchErrors(async (req, res) => {
  const { teamName, employees, supervisor } = req.body as any;

  const normalized = {
    teamName,
    members: Array.isArray(employees) ? employees : [],
    supervisor: supervisor ?? null,
  };

  const team = await createTeam(normalized);
  return res.status(CREATED).json(team);
});

export const listTeamsHandler = catchErrors(async (_req, res) => {
  const data = await listTeams();
  return res.json(data);
});

export const updateStaffHandler = catchErrors(async (req, res) => {
  const { id } = req.params as { id: string };
  const { members, supervisor } = req.body as {
    members?: string[];
    supervisor?: string | null;
  };
  const result = await updateTeamStaff(id, { members, supervisor });
  return res.status(OK).json(result);
});


