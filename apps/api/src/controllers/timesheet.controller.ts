import { Request, Response } from 'express';
import catchErrors from '../utils/catchErrors';
import { OK, CREATED, BAD_REQUEST, FORBIDDEN } from '../constants/http';
import { Timesheet, ITimesheet } from '../models/timesheet.model';
import ProjectModel from '../models/project.model';
import TeamModel from '../models/team.model';
import { TimesheetStatus } from '@tms/shared';
import { createTimesheetSchema, updateTimesheetSchema, submitTimesheetsSchema } from '../schemas/timesheet.schema';
import {createTimesheet,submitDraftTimesheets,updateDailyTimesheetStatus,batchUpdateDailyTimesheetStatus} from "../services/timesheet.service";
import {getMondayUTC} from '../utils/getMondayUTC'

//Create new timesheet
export const createMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const parsed = createTimesheetSchema.parse(req.body);
  let { weekStartDate, data } = parsed;
  weekStartDate = getMondayUTC(weekStartDate);
  
  const dataWithDailyStatus = data.map(category => ({
    ...category,
    items: category.items.map(item => ({
      ...item,
      dailyStatus: Array(7).fill(TimesheetStatus.Draft)
    }))
  }));
  
  const result = await createTimesheet({ userId, weekStartDate, data: dataWithDailyStatus });
  return res.status(CREATED).json(result);
});

//List my timesheets
export const listMyTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const timesheets = await Timesheet.find({ userId }).sort({ weekStartDate: -1 });
  return res.status(OK).json({ timesheets });
});

//List supervised timesheets
export const listSupervisedTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;

  // Get supervised employees from Projects
  const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });
  const projectSupervisedUserIds = Array.from(
    new Set(
      supervisedProjects.flatMap(p => p.employees?.map(e => e.toString()) || [])
    )
  );

  // Get supervised employees from Teams
  const supervisedTeams = await TeamModel.find({ supervisor: supervisorId });
  const teamSupervisedUserIds = Array.from(
    new Set(
      supervisedTeams.flatMap(t => t.members?.map(m => m.toString()) || [])
    )
  );

  // Combine both project and team supervised users
  const allSupervisedUserIds = Array.from(
    new Set([...projectSupervisedUserIds, ...teamSupervisedUserIds])
  );

  if (allSupervisedUserIds.length === 0) {
    return res.status(OK).json({ timesheets: [] });
  }

  const timesheets = await Timesheet.find({ userId: { $in: allSupervisedUserIds } })
    .populate('userId', 'firstName lastName email contactNumber designation')
    .sort({ weekStartDate: -1 });

  // Manually populate project names since projectId is stored as string
  const projectIds = new Set<string>();
  const teamIds = new Set<string>();
  
  timesheets.forEach(ts => {
    ts.data?.forEach(category => {
      category.items?.forEach(item => {
        if (item.projectId) {
          projectIds.add(item.projectId);
        }
        if (item.teamId) {
          teamIds.add(item.teamId);
        }
      });
    });
  });

  const projects = await ProjectModel.find({ _id: { $in: Array.from(projectIds) } });
  const teams = await TeamModel.find({ _id: { $in: Array.from(teamIds) } });
  
  const projectMap = new Map(projects.map(p => [p._id.toString(), p.projectName]));
  const teamMap = new Map(teams.map(t => [t._id.toString(), t.teamName]));

  // Add project and team names to timesheet items
  timesheets.forEach(ts => {
    ts.data?.forEach(category => {
      category.items?.forEach(item => {
        if (item.projectId && projectMap.has(item.projectId)) {
          (item as any).projectName = projectMap.get(item.projectId);
        }
        if (item.teamId && teamMap.has(item.teamId)) {
          (item as any).teamName = teamMap.get(item.teamId);
        }
      });
    });
  });

  return res.status(OK).json({ timesheets });
});

//Update status of supervised timesheets 
export const updateSupervisedTimesheetsStatusHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  const { ids, status } = req.body as { ids: string[]; status: TimesheetStatus };

  if (![TimesheetStatus.Approved, TimesheetStatus.Rejected].includes(status)) {
    return res.status(BAD_REQUEST).json({ message: 'Invalid status. Must be Approved or Rejected' });
  }

  // Get supervised employees from Projects
  const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });
  const projectSupervisedUserIds = Array.from(
    new Set(
      supervisedProjects.flatMap(p => p.employees?.map(e => e.toString()) || [])
    )
  );

  // Get supervised employees from Teams
  const supervisedTeams = await TeamModel.find({ supervisor: supervisorId });
  const teamSupervisedUserIds = Array.from(
    new Set(
      supervisedTeams.flatMap(t => t.members?.map(m => m.toString()) || [])
    )
  );

  // Combine both project and team supervised users
  const allSupervisedUserIds = Array.from(
    new Set([...projectSupervisedUserIds, ...teamSupervisedUserIds])
  );

  if (allSupervisedUserIds.length === 0) {
    return res.status(FORBIDDEN).json({ message: 'You have no supervised employees' });
  }

  // Only update timesheets from supervised employees (both project and team members)
  const result = await Timesheet.updateMany(
    { 
      _id: { $in: ids }, 
      userId: { $in: allSupervisedUserIds },
      status: TimesheetStatus.Pending 
    },
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

  if (data) {
    // Fetch existing timesheet to preserve dailyStatus
    const existingTimesheet = await Timesheet.findOne({ _id: timesheetId, userId });
    
    const dataWithDailyStatus = data.map((category, categoryIndex) => ({
      ...category,
      items: category.items.map((item, itemIndex) => {
        // Try to get existing dailyStatus from the same position
        const existingDailyStatus = existingTimesheet?.data?.[categoryIndex]?.items?.[itemIndex]?.dailyStatus;
        
        return {
          ...item,
          // Preserve existing dailyStatus if available, otherwise use provided dailyStatus, otherwise default to Draft
          dailyStatus: existingDailyStatus && existingDailyStatus.length === 7
            ? existingDailyStatus
            : (item as any).dailyStatus && (item as any).dailyStatus.length === 7 
              ? (item as any).dailyStatus 
              : Array(7).fill(TimesheetStatus.Draft)
        };
      })
    }));
    (updateData as any).data = dataWithDailyStatus;
  }

  if (status) updateData.status = status;

  const updated = await Timesheet.findOneAndUpdate(
    { _id: timesheetId, userId },
    { $set: updateData },
    { new: true }
  );

  return res.status(OK).json(updated);
});

// Delete my timesheet 
export const deleteMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const id = req.params.id;
  const deleted = await Timesheet.findOneAndDelete({ _id: id, userId });
  return res.status(OK).json(deleted);
});

//Submit draft timesheets
export const submitDraftTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const parsed = submitTimesheetsSchema.parse(req.body);
  const { ids } = parsed;

  const result = await submitDraftTimesheets(userId, ids);

  return res.status(OK).json(result);
});

// Get or create my timesheet for a given week
export const getOrCreateMyTimesheetForWeekHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const weekStartDateRaw = (req.query.weekStartDate as string) || '';
  let weekStartDate = getMondayUTC(weekStartDateRaw ? weekStartDateRaw : new Date());


  const ts = await Timesheet.findOneAndUpdate(
    { userId, weekStartDate },
    { $setOnInsert: { userId, weekStartDate, status: TimesheetStatus.Draft, data: [] } },
    { new: true, upsert: true }
  );

  return res.status(OK).json({ timesheet: ts });
});

//Update daily status of specific timesheet items 
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

//Batch update daily status of multiple timesheet items 
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


  // Validate request body
  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return res.status(BAD_REQUEST).json({ 
      message: 'Updates array is required and must not be empty' 
    });
  }

  // Validate all statuses
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
