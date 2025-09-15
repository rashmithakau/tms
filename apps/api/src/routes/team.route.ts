import { Router } from 'express';
import { createTeamHandler, listTeamsHandler, listTeamsForUserHandler, listMyMemberTeamsHandler, listSupervisedTeamsHandler, updateStaffHandler ,deleteTeamHandler} from '../controllers/team.controller';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';

const teamRoutes = Router();

teamRoutes.post('/', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), createTeamHandler);
teamRoutes.get('/', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), listTeamsHandler);
teamRoutes.put('/:id/staff', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), updateStaffHandler);
teamRoutes.delete('/:id', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), deleteTeamHandler);
teamRoutes.get('/my-teams', authenticate([UserRole.Emp, UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), listTeamsForUserHandler);
teamRoutes.get('/my-member-teams', authenticate([UserRole.Emp, UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), listMyMemberTeamsHandler);
teamRoutes.get('/supervised', authenticate([UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), listSupervisedTeamsHandler);

export default teamRoutes;


