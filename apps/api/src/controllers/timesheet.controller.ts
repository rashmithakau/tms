import { Request, Response } from 'express';
import { catchErrors } from '../utils/error';
import { OK, CREATED, BAD_REQUEST, FORBIDDEN } from '../constants/http';
import { TimesheetStatus } from '@tms/shared';
import { createTimesheetSchema, updateTimesheetSchema, submitTimesheetsSchema } from '../schemas/timesheet.schema';
import {
  createTimesheetWithBusinessLogic,
  submitDraftTimesheets,
  updateDailyTimesheetStatus,
  batchUpdateDailyTimesheetStatus,
  listUserTimesheets,
  getSupervisedTimesheets,
  updateSupervisedTimesheetsStatus,
  updateUserTimesheet,
  deleteUserTimesheet,
  getOrCreateTimesheetForWeek,
  requestTimesheetEdit,
  approveTimesheetEditRequest,
  rejectTimesheetEditRequest,
  getPendingEditRequestsForSupervisor
} from "../services/timesheet.service";
import { getMondayUTC } from '../utils/data';

export const createMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const parsed = createTimesheetSchema.parse(req.body);
  let { weekStartDate, data } = parsed;
  weekStartDate = getMondayUTC(weekStartDate);
  
  const result = await createTimesheetWithBusinessLogic(userId, weekStartDate, data);
  return res.status(CREATED).json(result);
});

export const listMyTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const timesheets = await listUserTimesheets(userId);
  return res.status(OK).json({ timesheets });
});

export const listSupervisedTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  const timesheets = await getSupervisedTimesheets(supervisorId);
  return res.status(OK).json({ timesheets });
});

export const updateSupervisedTimesheetsStatusHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  const { ids, status } = req.body as { ids: string[]; status: TimesheetStatus };

  if (![TimesheetStatus.Approved, TimesheetStatus.Rejected].includes(status)) {
    return res.status(BAD_REQUEST).json({ message: 'Invalid status. Must be Approved or Rejected' });
  }

  try {
    const result = await updateSupervisedTimesheetsStatus(supervisorId, ids, status);
    return res.status(OK).json(result);
  } catch (error: any) {
    return res.status(FORBIDDEN).json({ message: error.message });
  }
});

export const updateMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const timesheetId = req.params.id;
  const parsed = updateTimesheetSchema.parse(req.body);
  
  const updated = await updateUserTimesheet(userId, timesheetId, parsed);
  return res.status(OK).json(updated);
});

export const deleteMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const id = req.params.id;
  const deleted = await deleteUserTimesheet(userId, id);
  return res.status(OK).json(deleted);
});

export const submitDraftTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const parsed = submitTimesheetsSchema.parse(req.body);
  const { ids } = parsed;

  const result = await submitDraftTimesheets(userId, ids);

  return res.status(OK).json(result);
});


export const getOrCreateMyTimesheetForWeekHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const weekStartDateRaw = req.query.weekStartDate as string;
  
  const timesheet = await getOrCreateTimesheetForWeek(userId, weekStartDateRaw);
  return res.status(OK).json({ timesheet });
});


export const updateDailyTimesheetStatusHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  const { timesheetId, categoryIndex, itemIndex, dayIndices, status, rejectionReason } = req.body as {
    timesheetId: string;
    categoryIndex: number;
    itemIndex: number;
    dayIndices: number[];
    status: TimesheetStatus.Approved | TimesheetStatus.Rejected;
    rejectionReason?: string;
  };

  if (![TimesheetStatus.Approved, TimesheetStatus.Rejected].includes(status)) {
    return res.status(BAD_REQUEST).json({ message: 'Invalid status. Must be Approved or Rejected' });
  }

  const result = await updateDailyTimesheetStatus(
    supervisorId,
    timesheetId,
    categoryIndex,
    itemIndex,
    dayIndices,
    status,
    rejectionReason
  );

  return res.status(OK).json({ timesheet: result });
});

export const batchUpdateDailyTimesheetStatusHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  
  const { updates } = req.body as {
    updates: Array<{
      timesheetId: string;
      categoryIndex: number;
      itemIndex: number;
      dayIndices: number[];
      status: TimesheetStatus.Approved | TimesheetStatus.Rejected;
      rejectionReason?: string;
    }>;
  };

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return res.status(BAD_REQUEST).json({ 
      message: 'Updates array is required and must not be empty' 
    });
  }

  const validStatuses = [TimesheetStatus.Approved, TimesheetStatus.Rejected];
  for (const update of updates) {
    if (!validStatuses.includes(update.status)) {
      return res.status(BAD_REQUEST).json({ 
        message: `Invalid status '${update.status}'. Must be Approved or Rejected` 
      });
    }
  }

  const results = await batchUpdateDailyTimesheetStatus(supervisorId, updates);
  return res.status(OK).json({ timesheets: results });
});

export const requestTimesheetEditHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { timesheetId } = req.body;

  const result = await requestTimesheetEdit(userId, timesheetId);
  return res.status(OK).json(result);
});

export const approveTimesheetEditRequestHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  const { timesheetId } = req.body;

  const result = await approveTimesheetEditRequest(supervisorId, timesheetId);
  return res.status(OK).json(result);
});

export const rejectTimesheetEditRequestHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  const { timesheetId } = req.body;

  const result = await rejectTimesheetEditRequest(supervisorId, timesheetId);
  return res.status(OK).json(result);
});

export const getPendingEditRequestsHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;

  const editRequests = await getPendingEditRequestsForSupervisor(supervisorId);
  return res.status(OK).json({ editRequests });
});
