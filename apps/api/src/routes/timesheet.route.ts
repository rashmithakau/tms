import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';
import { createMyTimesheetHandler, deleteMyTimesheetHandler, getOrCreateMyTimesheetForWeekHandler, listMyTimesheetsHandler, listSupervisedTimesheetsHandler, submitDraftTimesheetsHandler, updateMyTimesheetHandler, updateSupervisedTimesheetsStatusHandler, updateDailyTimesheetStatusHandler, batchUpdateDailyTimesheetStatusHandler, requestTimesheetEditHandler, approveTimesheetEditRequestHandler, rejectTimesheetEditRequestHandler, getPendingEditRequestsHandler } from '../controllers/timesheet.controller';
const timesheetRoutes = Router();

timesheetRoutes.post('/', authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), createMyTimesheetHandler);//done
timesheetRoutes.get('/', authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), listMyTimesheetsHandler);//done
timesheetRoutes.get('/week', authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), getOrCreateMyTimesheetForWeekHandler);
timesheetRoutes.get('/supervised', authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), listSupervisedTimesheetsHandler);
timesheetRoutes.post('/supervised/status', authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), updateSupervisedTimesheetsStatusHandler);
timesheetRoutes.post('/supervised/daily-status', authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), updateDailyTimesheetStatusHandler);
timesheetRoutes.post('/supervised/daily-status-batch', authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), batchUpdateDailyTimesheetStatusHandler);
timesheetRoutes.patch('/:id', authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), updateMyTimesheetHandler);
timesheetRoutes.delete('/:id', authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), deleteMyTimesheetHandler);
timesheetRoutes.post('/submit', authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), submitDraftTimesheetsHandler);//done
timesheetRoutes.post('/request-edit', authenticate([UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), requestTimesheetEditHandler);
timesheetRoutes.post('/approve-edit-request', authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), approveTimesheetEditRequestHandler);
timesheetRoutes.post('/reject-edit-request', authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), rejectTimesheetEditRequestHandler);
timesheetRoutes.get('/pending-edit-requests', authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), getPendingEditRequestsHandler);

export default timesheetRoutes;



