import { Router } from 'express';
import { createTeamHandler, listTeamsHandler, listTeamsForUserHandler, listMyMemberTeamsHandler, listSupervisedTeamsHandler, updateStaffHandler } from '../controllers/team.controller';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';

const teamRoutes = Router();

teamRoutes.post('/', authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), createTeamHandler);
teamRoutes.get('/', authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), listTeamsHandler);
teamRoutes.get('/my-teams', authenticate([UserRole.Emp, UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), listTeamsForUserHandler);
teamRoutes.get('/my-member-teams', authenticate([UserRole.Emp, UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), listMyMemberTeamsHandler);
teamRoutes.get('/supervised', authenticate([UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), listSupervisedTeamsHandler);
teamRoutes.put('/:id/staff', authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), updateStaffHandler);

export default teamRoutes;


