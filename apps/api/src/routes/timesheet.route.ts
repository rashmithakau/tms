import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';
import { createMyTimesheetHandler, deleteMyTimesheetHandler, getOrCreateMyTimesheetForWeekHandler, listMyTimesheetsHandler, listSupervisedTimesheetsHandler, submitDraftTimesheetsHandler, updateMyTimesheetHandler, updateSupervisedTimesheetsStatusHandler } from '../controllers/timesheet.controller';
const timesheetRoutes = Router();

timesheetRoutes.post('/', authenticate([UserRole.Emp,UserRole.Supervisor]), createMyTimesheetHandler);//done
timesheetRoutes.get('/', authenticate([UserRole.Emp,UserRole.Supervisor]), listMyTimesheetsHandler);//done
timesheetRoutes.get('/week', authenticate([UserRole.Emp,UserRole.Supervisor]), getOrCreateMyTimesheetForWeekHandler);
timesheetRoutes.get('/supervised', authenticate([UserRole.Supervisor]), listSupervisedTimesheetsHandler);
timesheetRoutes.post('/supervised/status', authenticate([UserRole.Supervisor]), updateSupervisedTimesheetsStatusHandler);
timesheetRoutes.patch('/:id', authenticate([UserRole.Emp,UserRole.Supervisor]), updateMyTimesheetHandler);
timesheetRoutes.delete('/:id', authenticate([UserRole.Emp,UserRole.Supervisor]), deleteMyTimesheetHandler);
timesheetRoutes.post('/submit', authenticate([UserRole.Emp,UserRole.Supervisor]), submitDraftTimesheetsHandler);//done

export default timesheetRoutes;



