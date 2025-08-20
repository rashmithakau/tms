import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';
import { createMyTimesheetHandler, deleteMyTimesheetHandler, listMyTimesheetsHandler, updateMyTimesheetHandler } from '../controllers/timesheet.controller';

const timesheetRoutes = Router();

// Employees can manage their own timesheets; Admin/Supervisor could also read in future
timesheetRoutes.post('/', authenticate([UserRole.Emp,UserRole.Supervisor]), createMyTimesheetHandler);
timesheetRoutes.get('/', authenticate([UserRole.Emp,UserRole.Supervisor]), listMyTimesheetsHandler);
timesheetRoutes.patch('/:id', authenticate([UserRole.Emp,UserRole.Supervisor]), updateMyTimesheetHandler);
timesheetRoutes.delete('/:id', authenticate([UserRole.Emp,UserRole.Supervisor]), deleteMyTimesheetHandler);

export default timesheetRoutes;



