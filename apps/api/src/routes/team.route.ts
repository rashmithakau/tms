import { Router } from 'express';
import { createTeamHandler, listTeamsHandler } from '../controllers/team.controller';

const teamRoutes = Router();

teamRoutes.post('/', createTeamHandler);
teamRoutes.get('/', listTeamsHandler);

export default teamRoutes;


