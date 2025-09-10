import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';
import { createMyTimesheetHandler, deleteMyTimesheetHandler, getOrCreateMyTimesheetForWeekHandler, listMyTimesheetsHandler, listSupervisedTimesheetsHandler, submitDraftTimesheetsHandler, updateMyTimesheetHandler, updateSupervisedTimesheetsStatusHandler, updateDailyTimesheetStatusHandler, batchUpdateDailyTimesheetStatusHandler } from '../controllers/timesheet.controller';
const timesheetRoutes = Router();

timesheetRoutes.post('/', authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin]), createMyTimesheetHandler);//done
timesheetRoutes.get('/', authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin]), listMyTimesheetsHandler);//done
timesheetRoutes.get('/week', authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin]), getOrCreateMyTimesheetForWeekHandler);
timesheetRoutes.get('/supervised', authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin]), listSupervisedTimesheetsHandler);
timesheetRoutes.post('/supervised/status', authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin]), updateSupervisedTimesheetsStatusHandler);
timesheetRoutes.post('/supervised/daily-status', authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin]), updateDailyTimesheetStatusHandler);
timesheetRoutes.post('/supervised/daily-status-batch', authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin]), batchUpdateDailyTimesheetStatusHandler);
timesheetRoutes.patch('/:id', authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin]), updateMyTimesheetHandler);
timesheetRoutes.delete('/:id', authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin]), deleteMyTimesheetHandler);
timesheetRoutes.post('/submit', authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin]), submitDraftTimesheetsHandler);//done

export default timesheetRoutes;



