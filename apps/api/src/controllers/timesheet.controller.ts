import { Request, Response } from 'express';
import catchErrors from '../utils/catchErrors';
import { OK, CREATED } from '../constants/http';
import { createTimesheetSchema, updateTimesheetSchema } from '../schemas/timesheet.schema';
import { createTimesheet, deleteMyTimesheet, listMyTimesheets, updateMyTimesheet } from '../services/timesheet.service';

export const createMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const parsed = createTimesheetSchema.parse(req.body);
  const userId = req.userId as string;

  const result = await createTimesheet({
    userId,
    date: new Date(parsed.date as any),
    projectName: parsed.projectName,
    taskTitle: parsed.taskTitle,
    description: parsed.description,
    plannedHours: parsed.plannedHours,
    hoursSpent: parsed.hoursSpent,
    billableType: parsed.billableType,
  });

  return res.status(CREATED).json(result);
});

export const listMyTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const result = await listMyTimesheets(userId);
  return res.status(OK).json(result);
});

export const updateMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { id } = req.params;
  const parsed = updateTimesheetSchema.parse(req.body);
  const result = await updateMyTimesheet(userId, id, {
    ...parsed,
    // Normalize date to Date if provided as string
    ...(parsed.date ? { date: new Date(parsed.date as any) } : {}),
  } as any);
  return res.status(OK).json(result);
});

export const deleteMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { id } = req.params;
  const result = await deleteMyTimesheet(userId, id);
  return res.status(OK).json(result);
});


