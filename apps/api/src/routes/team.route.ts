import { Router } from 'express';
import { createTeamHandler, listTeamsHandler, updateStaffHandler } from '../controllers/team.controller';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';

const teamRoutes = Router();

teamRoutes.post('/', authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), createTeamHandler);
teamRoutes.get('/', authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), listTeamsHandler);
teamRoutes.put('/:id/staff', authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), updateStaffHandler);

export default teamRoutes;


