import { Request, Response } from 'express';
import catchErrors from '../utils/catchErrors';
import { OK, CREATED } from '../constants/http';
import { createTimesheetSchema, submitTimesheetsSchema, updateTimesheetSchema } from '../schemas/timesheet.schema';
import { createTimesheet, deleteMyTimesheet, listMyTimesheets, listSupervisedTimesheets, submitDraftTimesheets, updateMyTimesheet, updateSupervisedTimesheetsStatus } from '../services/timesheet.service';
import { TimesheetStatus } from '@tms/shared';

export const createMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const parsed = createTimesheetSchema.parse(req.body);
  const userId = req.userId as string;

  const result = await createTimesheet({
    userId,
    date: new Date(parsed.date as any),
    projectId: parsed.projectId,
    taskTitle: parsed.taskTitle,
    description: parsed.description,
    plannedHours: parsed.plannedHours,
    hoursSpent: parsed.hoursSpent,
    billableType: parsed.billableType
  });

  return res.status(CREATED).json(result);
});

export const listMyTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const result = await listMyTimesheets(userId);
  return res.status(OK).json(result);
});

export const listSupervisedTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  const result = await listSupervisedTimesheets(supervisorId);
  return res.status(OK).json(result);
});

export const updateSupervisedTimesheetsStatusHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  const { ids, status } = req.body as { ids: string[]; status: TimesheetStatus };
  if (![TimesheetStatus.Approved, TimesheetStatus.Rejected].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be Approved or Rejected' });
  }
  const narrowed = status as TimesheetStatus.Approved | TimesheetStatus.Rejected;
  const result = await updateSupervisedTimesheetsStatus(supervisorId, ids, narrowed);
  return res.status(OK).json(result);
});

export const updateMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const parsed = updateTimesheetSchema.parse(req.body);
  const userId = req.userId as string;
  const id = req.params.id;

  const updateData: any = {};
  if (parsed.date) updateData.date = new Date(parsed.date as any);
  if (parsed.projectId) updateData.projectId = parsed.projectId;
  if (parsed.taskTitle) updateData.taskTitle = parsed.taskTitle;
  if (parsed.description !== undefined) updateData.description = parsed.description;
  if (parsed.plannedHours !== undefined) updateData.plannedHours = parsed.plannedHours;
  if (parsed.hoursSpent !== undefined) updateData.hoursSpent = parsed.hoursSpent;
  if (parsed.billableType) updateData.billableType = parsed.billableType;
  if (parsed.status) updateData.status = parsed.status;

  const result = await updateMyTimesheet(userId, id, updateData);
  return res.status(OK).json(result);
});

export const deleteMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const id = req.params.id;
  const result = await deleteMyTimesheet(userId, id);
  return res.status(OK).json(result);
});

export const submitDraftTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const parsed = submitTimesheetsSchema.parse(req.body);
  const userId = req.userId as string;
  const result = await submitDraftTimesheets(userId, parsed.ids);
  return res.status(OK).json(result);
});


