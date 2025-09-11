import { Router } from 'express';
import { createTeamHandler, listTeamsHandler, listTeamsForUserHandler, updateStaffHandler } from '../controllers/team.controller';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';

const teamRoutes = Router();

teamRoutes.post('/', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), createTeamHandler);
teamRoutes.get('/', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), listTeamsHandler);
teamRoutes.get('/my-teams', authenticate([UserRole.Emp, UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), listTeamsForUserHandler);
teamRoutes.put('/:id/staff', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), updateStaffHandler);

export default teamRoutes;


