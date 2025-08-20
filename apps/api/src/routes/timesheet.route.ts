import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';
import { createMyTimesheetHandler, deleteMyTimesheetHandler, listMyTimesheetsHandler, submitDraftTimesheetsHandler, updateMyTimesheetHandler } from '../controllers/timesheet.controller';

const timesheetRoutes = Router();

// Employees can manage their own timesheets; Admin/Supervisor could also read in future
timesheetRoutes.post('/', authenticate([UserRole.Emp]), createMyTimesheetHandler);
timesheetRoutes.get('/', authenticate([UserRole.Emp]), listMyTimesheetsHandler);
timesheetRoutes.patch('/:id', authenticate([UserRole.Emp]), updateMyTimesheetHandler);
timesheetRoutes.delete('/:id', authenticate([UserRole.Emp]), deleteMyTimesheetHandler);
timesheetRoutes.post('/submit', authenticate([UserRole.Emp]), submitDraftTimesheetsHandler);

export default timesheetRoutes;



