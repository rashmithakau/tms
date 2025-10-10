import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';
import { listMyNotificationsHandler, markAllMyNotificationsReadHandler } from '../controllers/notification.controller';

const router = Router();

router.get('/', authenticate([UserRole.SuperAdmin, UserRole.Emp, UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin]), listMyNotificationsHandler);
router.post('/mark-all-read', authenticate([UserRole.SuperAdmin, UserRole.Emp, UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin]), markAllMyNotificationsReadHandler);

export default router;


