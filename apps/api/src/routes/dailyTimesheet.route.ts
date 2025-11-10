import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';
import {
  createDailyTimesheetHandler,
  listMyDailyTimesheetsHandler,
  getDailyTimesheetHandler,
  updateDailyTimesheetHandler,
  deleteDailyTimesheetHandler,
  submitDailyTimesheetsHandler,
  listSupervisedDailyTimesheetsHandler,
  bulkUpdateDailyTimesheetStatusHandler,
} from '../controllers/dailyTimesheet.controller';

const dailyTimesheetRoutes = Router();

// Employee routes
dailyTimesheetRoutes.post(
  '/',
  authenticate([UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin]),
  createDailyTimesheetHandler
);

dailyTimesheetRoutes.get(
  '/',
  authenticate([UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin]),
  listMyDailyTimesheetsHandler
);

dailyTimesheetRoutes.get(
  '/:id',
  authenticate([UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin]),
  getDailyTimesheetHandler
);

dailyTimesheetRoutes.patch(
  '/:id',
  authenticate([UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin]),
  updateDailyTimesheetHandler
);

dailyTimesheetRoutes.delete(
  '/:id',
  authenticate([UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin]),
  deleteDailyTimesheetHandler
);

dailyTimesheetRoutes.post(
  '/submit',
  authenticate([UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin]),
  submitDailyTimesheetsHandler
);

// Supervisor routes
dailyTimesheetRoutes.get(
  '/supervised/list',
  authenticate([UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin]),
  listSupervisedDailyTimesheetsHandler
);

dailyTimesheetRoutes.post(
  '/supervised/update-status',
  authenticate([UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin]),
  bulkUpdateDailyTimesheetStatusHandler
);

export default dailyTimesheetRoutes;
