import { Router } from 'express';
import { createTeamHandler, listTeamsHandler, updateStaffHandler, deleteTeamHandler } from '../controllers/team.controller';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';

const teamRoutes = Router();

teamRoutes.post('/', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), createTeamHandler);
teamRoutes.get('/', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), listTeamsHandler);
teamRoutes.put('/:id/staff', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), updateStaffHandler);
teamRoutes.delete('/:id', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), deleteTeamHandler);

export default teamRoutes;


