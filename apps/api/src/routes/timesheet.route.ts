import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';
import { 
  createMyTimesheetHandler, 
  deleteMyTimesheetHandler, 
  getOrCreateMyTimesheetForWeekHandler, 
  listMyTimesheetsHandler, 
  listSupervisedTimesheetsHandler, 
  submitDraftTimesheetsHandler, 
  updateMyTimesheetHandler, 
  updateSupervisedTimesheetsStatusHandler,
  getTimesheetStatsHandler,
  bulkUpdateTimesheetHandler
} from '../controllers/timesheet.controller';

const timesheetRoutes = Router();

// Employee/Supervisor timesheet management
timesheetRoutes.post('/', authenticate([UserRole.Emp, UserRole.Supervisor]), createMyTimesheetHandler);
timesheetRoutes.get('/', authenticate([UserRole.Emp, UserRole.Supervisor]), listMyTimesheetsHandler);
timesheetRoutes.get('/week', authenticate([UserRole.Emp, UserRole.Supervisor]), getOrCreateMyTimesheetForWeekHandler);
timesheetRoutes.get('/stats', authenticate([UserRole.Emp, UserRole.Supervisor]), getTimesheetStatsHandler);
timesheetRoutes.patch('/:id', authenticate([UserRole.Emp, UserRole.Supervisor]), updateMyTimesheetHandler);
timesheetRoutes.put('/bulk-update', authenticate([UserRole.Emp, UserRole.Supervisor]), bulkUpdateTimesheetHandler);
timesheetRoutes.delete('/:id', authenticate([UserRole.Emp, UserRole.Supervisor]), deleteMyTimesheetHandler);
timesheetRoutes.post('/submit', authenticate([UserRole.Emp, UserRole.Supervisor]), submitDraftTimesheetsHandler);

// Supervisor-specific routes
timesheetRoutes.get('/supervised', authenticate([UserRole.Supervisor]), listSupervisedTimesheetsHandler);
timesheetRoutes.post('/supervised/status', authenticate([UserRole.Supervisor]), updateSupervisedTimesheetsStatusHandler);

export default timesheetRoutes;



