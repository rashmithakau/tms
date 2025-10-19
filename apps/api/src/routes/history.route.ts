import { Router } from 'express';
import { getHistoryHandler } from '../controllers/history.controller';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';

const router = Router();

router.get(
  '/',
  authenticate([
    UserRole.SuperAdmin,
    UserRole.Admin,
    UserRole.SupervisorAdmin,
  ]),
  getHistoryHandler
);

export default router;
