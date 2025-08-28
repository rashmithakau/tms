// controllers/timesheet.controller.ts
import { Request, Response } from 'express';
import catchErrors from '../utils/catchErrors';
import { OK, CREATED, BAD_REQUEST } from '../constants/http';
import { Timesheet, ITimesheet } from '../models/timesheet.model';
import ProjectModel from '../models/project.model';
import { TimesheetStatus } from '@tms/shared';
import { createTimesheetSchema, updateTimesheetSchema, submitTimesheetsSchema } from '../schemas/timesheet.schema';
import {createTimesheet} from "../services/timesheet.service";

// --- Create new timesheet ---
export const createMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const {  weekStartDate, data } = req.body;
  console.log(data);
  const parsed = createTimesheetSchema.parse({ weekStartDate,categories: data });
  console.log(parsed);
  const result =createTimesheet({userId,weekStartDate,data});

  return res.status(CREATED).json(result);
});

// --- List my timesheets ---
export const listMyTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const timesheets = await Timesheet.find({ userId }).sort({ weekStartDate: -1 });
  return res.status(OK).json(timesheets);
});

// --- List supervised timesheets ---
export const listSupervisedTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;

  // Fetch supervised employees from Projects
  const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });
  const supervisedUserIds = Array.from(
    new Set(
      supervisedProjects.flatMap(p => p.employees?.map(e => e.toString()) || [])
    )
  );

  const timesheets = await Timesheet.find({ userId: { $in: supervisedUserIds } })
    .sort({ weekStartDate: -1 });

  return res.status(OK).json(timesheets);
});

// --- Update status of supervised timesheets ---
export const updateSupervisedTimesheetsStatusHandler = catchErrors(async (req: Request, res: Response) => {
  const { ids, status } = req.body as { ids: string[]; status: TimesheetStatus };

  if (![TimesheetStatus.Approved, TimesheetStatus.Rejected].includes(status)) {
    return res.status(BAD_REQUEST).json({ message: 'Invalid status. Must be Approved or Rejected' });
  }

  const result = await Timesheet.updateMany(
    { _id: { $in: ids }, status: TimesheetStatus.Pending },
    { $set: { status } }
  );

  return res.status(OK).json(result);
});

// --- Update my timesheet ---
export const updateMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const timesheetId = req.params.id;

  const parsed = updateTimesheetSchema.parse(req.body);
  const { weekStartDate, categories, status } = parsed;

  const updateData: Partial<ITimesheet> = {};
  if (weekStartDate) updateData.weekStartDate = new Date(weekStartDate);
  //if (categories) updateData.categories = categories;
  if (status) updateData.status = status;

  const updated = await Timesheet.findOneAndUpdate(
    { _id: timesheetId, userId },
    { $set: updateData },
    { new: true }
  );

  return res.status(OK).json(updated);
});

// --- Delete my timesheet ---
export const deleteMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const id = req.params.id;
  const deleted = await Timesheet.findOneAndDelete({ _id: id, userId });
  return res.status(OK).json(deleted);
});

// --- Submit draft timesheets ---
export const submitDraftTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const parsed = submitTimesheetsSchema.parse(req.body);
  const { ids } = parsed;

  const result = await Timesheet.updateMany(
    { _id: { $in: ids }, userId, status: TimesheetStatus.Draft },
    { $set: { status: TimesheetStatus.Pending } }
  );

  return res.status(OK).json(result);
});
