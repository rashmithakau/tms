// controllers/timesheet.controller.ts
import { Request, Response } from 'express';
import catchErrors from '../utils/catchErrors';
import { OK, CREATED, BAD_REQUEST } from '../constants/http';
import { Timesheet, ITimesheet } from '../models/timesheet.model';
import ProjectModel from '../models/project.model';
import UserModel from '../models/user.model';
import { TimesheetStatus } from '@tms/shared';
import { createTimesheetSchema, updateTimesheetSchema, submitTimesheetsSchema } from '../schemas/timesheet.schema';
import {createTimesheet, submitDraftTimesheets} from "../services/timesheet.service";

// --- Create new timesheet ---
export const createMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const parsed = createTimesheetSchema.parse(req.body);
  const { weekStartDate, data } = parsed;
  const result = await createTimesheet({ userId, weekStartDate, data });

  return res.status(CREATED).json(result);
});

// --- List my timesheets ---
export const listMyTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const timesheets = await Timesheet.find({ userId }).sort({ weekStartDate: -1 });
  return res.status(OK).json({ timesheets });
});

// --- List supervised timesheets with enhanced filtering ---
export const listSupervisedTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  const { status, startDate, endDate, employeeId } = req.query;

  // Fetch supervised employees from Projects
  const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });
  const supervisedUserIds = Array.from(
    new Set(
      supervisedProjects.flatMap(p => p.employees?.map(e => e.toString()) || [])
    )
  );

  // Build query filter
  const filter: any = { userId: { $in: supervisedUserIds } };
  
  if (status && status !== 'All') {
    filter.status = status;
  }
  
  if (employeeId) {
    filter.userId = employeeId;
  }
  
  if (startDate && endDate) {
    filter.weekStartDate = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  }

  const timesheets = await Timesheet.find(filter)
    .populate('userId', 'firstName lastName email contactNumber designation')
    .populate('reviewedBy', 'firstName lastName email')
    .sort({ weekStartDate: -1, status: 1 });

  return res.status(OK).json({ timesheets });
});

// --- Update status of supervised timesheets ---
export const updateSupervisedTimesheetsStatusHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  const { ids, status } = req.body as { ids: string[]; status: TimesheetStatus };

  if (![TimesheetStatus.Approved, TimesheetStatus.Rejected].includes(status)) {
    return res.status(BAD_REQUEST).json({ message: 'Invalid status. Must be Approved or Rejected' });
  }

  // Verify supervisor has permission to update these timesheets
  const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });
  const supervisedUserIds = Array.from(
    new Set(
      supervisedProjects.flatMap(p => p.employees?.map(e => e.toString()) || [])
    )
  );

  const result = await Timesheet.updateMany(
    { 
      _id: { $in: ids }, 
      status: TimesheetStatus.Pending,
      userId: { $in: supervisedUserIds }
    },
    { 
      $set: { 
        status,
        reviewedBy: supervisorId,
        reviewedAt: new Date()
      } 
    }
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
  
  // Parse and validate the date
  let weekStartDate: Date;
  if (weekStartDateRaw) {
    weekStartDate = new Date(weekStartDateRaw);
    // Check if the date is valid
    if (isNaN(weekStartDate.getTime())) {
      return res.status(BAD_REQUEST).json({ message: 'Invalid date format' });
    }
  } else {
    // Default to current week's Monday
    const now = new Date();
    const day = now.getDay(); // 0=Sun..6=Sat
    const diffToMonday = (day + 6) % 7; // days since Monday
    weekStartDate = new Date(now);
    weekStartDate.setDate(now.getDate() - diffToMonday);
  }
  
  // Normalize to start of day
  weekStartDate.setHours(0, 0, 0, 0);

  try {
    // First try to find existing timesheet
    let ts = await Timesheet.findOne({ userId, weekStartDate });
    if (!ts) {
      // Create new timesheet if it doesn't exist
      const created = await createTimesheet({ userId, weekStartDate, data: [] });
      return res.status(CREATED).json(created);
    }
    return res.status(OK).json({ timesheet: ts });
  } catch (error: any) {
    console.error('Error in getOrCreateMyTimesheetForWeekHandler:', error);
    
    // Handle duplicate key error (E11000)
    if (error.code === 11000) {
      // If duplicate, try to find the existing one
      const existing = await Timesheet.findOne({ userId, weekStartDate });
      if (existing) {
        return res.status(OK).json({ timesheet: existing });
      }
    }
    
    // Re-throw the error to be handled by global error handler
    throw error;
  }
});

// --- Get timesheet statistics for dashboard ---
export const getTimesheetStatsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { startDate, endDate } = req.query;
  
  const filter: any = { userId };
  if (startDate && endDate) {
    filter.weekStartDate = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  }

  const stats = await Timesheet.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalHours: { $sum: '$totalHours' }
      }
    }
  ]);

  const totalTimesheets = await Timesheet.countDocuments(filter);
  const totalHours = await Timesheet.aggregate([
    { $match: filter },
    { $group: { _id: null, total: { $sum: '$totalHours' } } }
  ]);

  return res.status(OK).json({
    stats,
    totalTimesheets,
    totalHours: totalHours[0]?.total || 0
  });
});

// --- Bulk update timesheet data ---
export const bulkUpdateTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { timesheetId, data } = req.body;

  const timesheet = await Timesheet.findOne({ _id: timesheetId, userId });
  if (!timesheet) {
    return res.status(BAD_REQUEST).json({ message: 'Timesheet not found' });
  }

  if (timesheet.status !== TimesheetStatus.Draft) {
    return res.status(BAD_REQUEST).json({ message: 'Can only update draft timesheets' });
  }

  const updated = await Timesheet.findByIdAndUpdate(
    timesheetId,
    { $set: { data } },
    { new: true, runValidators: true }
  );

  return res.status(OK).json({ timesheet: updated });
});
