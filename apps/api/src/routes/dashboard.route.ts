import { Router } from 'express';
import { getAdminDashboardStats, getTimesheetRejectionReasons } from '../controllers/dashboard.controller';
import authenticate from '../middleware/authenticate';

const router = Router();

router.get('/stats', getAdminDashboardStats);
router.get('/rejected-timesheets', getTimesheetRejectionReasons);

export default router;
