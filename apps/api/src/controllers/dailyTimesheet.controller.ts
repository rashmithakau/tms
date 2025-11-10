import { Request, Response } from 'express';
import { catchErrors } from '../utils/error';
import { OK, CREATED } from '../constants/http';
import {
  createDailyTimesheetSchema,
  updateDailyTimesheetSchema,
  listDailyTimesheetsSchema,
  submitDailyTimesheetsSchema,
  bulkUpdateStatusSchema,
} from '../schemas/dailyTimesheet.schema';
import {
  createDailyTimesheet,
  listDailyTimesheets,
  getDailyTimesheetById,
  updateDailyTimesheet,
  deleteDailyTimesheet,
  submitDailyTimesheets,
  bulkUpdateDailyTimesheetStatus,
  getSupervisedDailyTimesheets,
} from '../services/dailyTimesheet.service';

export const createDailyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const parsed = createDailyTimesheetSchema.parse(req.body);
  
  const timesheet = await createDailyTimesheet(userId, parsed);
  return res.status(CREATED).json({ timesheet });
});

export const listMyDailyTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { startDate, endDate, status, projectId } = req.query;
  
  const timesheets = await listDailyTimesheets({
    userId,
    startDate: startDate as string,
    endDate: endDate as string,
    status: status as any,
    projectId: projectId as string,
  });
  
  return res.status(OK).json({ timesheets });
});

export const getDailyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const timesheetId = req.params.id;
  
  const timesheet = await getDailyTimesheetById(userId, timesheetId);
  return res.status(OK).json({ timesheet });
});

export const updateDailyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const timesheetId = req.params.id;
  const parsed = updateDailyTimesheetSchema.parse(req.body);
  
  const timesheet = await updateDailyTimesheet(userId, timesheetId, parsed);
  return res.status(OK).json({ timesheet });
});

export const deleteDailyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const timesheetId = req.params.id;
  
  const result = await deleteDailyTimesheet(userId, timesheetId);
  return res.status(OK).json(result);
});

export const submitDailyTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const parsed = submitDailyTimesheetsSchema.parse(req.body);
  
  const result = await submitDailyTimesheets(userId, parsed);
  return res.status(OK).json(result);
});

export const listSupervisedDailyTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  
  const timesheets = await getSupervisedDailyTimesheets(supervisorId);
  return res.status(OK).json({ timesheets });
});

export const bulkUpdateDailyTimesheetStatusHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  const parsed = bulkUpdateStatusSchema.parse(req.body);
  
  const result = await bulkUpdateDailyTimesheetStatus(supervisorId, parsed);
  return res.status(OK).json(result);
});
