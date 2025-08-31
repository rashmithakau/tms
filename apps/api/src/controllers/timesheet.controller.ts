// Helper to get Monday of the week for a given date (UTC)
function getMondayUTC(dateInput: Date | string): Date {
  // Always parse as UTC: if string is 'YYYY-MM-DD', treat as UTC midnight
  let date: Date;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    date = new Date(dateInput + 'T00:00:00Z');
  } else {
    date = new Date(dateInput);
  }
  const day = date.getUTCDay();
  // If already Monday, just normalize to UTC midnight
  if (day === 1) {
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }
  // getUTCDay: 0=Sunday, 1=Monday, ..., 6=Saturday
  const diff = (day === 0 ? -6 : 1 - day); // If Sunday, go back 6 days; else, back to Monday
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
// controllers/timesheet.controller.ts
import { Request, Response } from 'express';
import catchErrors from '../utils/catchErrors';
import { OK, CREATED, BAD_REQUEST, FORBIDDEN, NOT_FOUND } from '../constants/http';
import { Timesheet, ITimesheet } from '../models/timesheet.model';
import ProjectModel from '../models/project.model';
import { TimesheetStatus } from '@tms/shared';
import { createTimesheetSchema, updateTimesheetSchema, submitTimesheetsSchema } from '../schemas/timesheet.schema';
import {createTimesheet,submitDraftTimesheets,updateDailyTimesheetStatus} from "../services/timesheet.service";

// --- Create new timesheet ---
export const createMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const parsed = createTimesheetSchema.parse(req.body);
  let { weekStartDate, data } = parsed;
  console.log(weekStartDate+" is week start date");
  // Always use Monday as week start (UTC)
  weekStartDate = getMondayUTC(weekStartDate);
  const result = await createTimesheet({ userId, weekStartDate, data });
  return res.status(CREATED).json(result);
});

// --- List my timesheets ---
export const listMyTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const timesheets = await Timesheet.find({ userId }).sort({ weekStartDate: -1 });
  return res.status(OK).json({ timesheets });
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

  if (supervisedUserIds.length === 0) {
    return res.status(OK).json({ timesheets: [] });
  }

  const timesheets = await Timesheet.find({ userId: { $in: supervisedUserIds } })
    .populate('userId', 'firstName lastName email contactNumber designation')
    .sort({ weekStartDate: -1 });

  // Manually populate project names since projectId is stored as string
  const projectIds = new Set<string>();
  timesheets.forEach(ts => {
    ts.data?.forEach(category => {
      category.items?.forEach(item => {
        if (item.projectId) {
          projectIds.add(item.projectId);
        }
      });
    });
  });

  const projects = await ProjectModel.find({ _id: { $in: Array.from(projectIds) } });
  const projectMap = new Map(projects.map(p => [p._id.toString(), p.projectName]));

  // Add project names to timesheet items
  timesheets.forEach(ts => {
    ts.data?.forEach(category => {
      category.items?.forEach(item => {
        if (item.projectId && projectMap.has(item.projectId)) {
          (item as any).projectName = projectMap.get(item.projectId);
        }
      });
    });
  });

  return res.status(OK).json({ timesheets });
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
  const { weekStartDate, data, status } = parsed;

  const updateData: Partial<ITimesheet> = {};
  if (weekStartDate) updateData.weekStartDate = new Date(weekStartDate);
  if (data) (updateData as any).data = data;
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

  const result = await submitDraftTimesheets(userId, ids);

  return res.status(OK).json(result);
});

// --- Get or create my timesheet for a given week ---
export const getOrCreateMyTimesheetForWeekHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const weekStartDateRaw = (req.query.weekStartDate as string) || '';
  let weekStartDate = getMondayUTC(weekStartDateRaw ? weekStartDateRaw : new Date());

  // Atomic upsert: create if not exists, else return existing
  const ts = await Timesheet.findOneAndUpdate(
    { userId, weekStartDate },
    { $setOnInsert: { userId, weekStartDate, status: TimesheetStatus.Draft, data: [] } },
    { new: true, upsert: true }
  );
  return res.status(OK).json({ timesheet: ts });
});

// --- Update daily status of specific timesheet items ---
export const updateDailyTimesheetStatusHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  const { timesheetId, categoryIndex, itemIndex, dayIndices, status } = req.body as {
    timesheetId: string;
    categoryIndex: number;
    itemIndex: number;
    dayIndices: number[];
    status: TimesheetStatus.Approved | TimesheetStatus.Rejected;
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
    status
  );

  return res.status(OK).json({ timesheet: result });
});
