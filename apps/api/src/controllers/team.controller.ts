import { CREATED } from '../constants/http';
import catchErrors from '../utils/catchErrors';
import { createTeam, listTeams } from '../services/team.service';

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


