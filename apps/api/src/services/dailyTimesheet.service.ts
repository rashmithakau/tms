import { TimesheetStatus } from '@tms/shared';
import { DailyTimesheet } from '../models/dailyTimesheet.model';
import { 
  IDailyTimesheetInput, 
  IDailyTimesheetUpdate,
  IListDailyTimesheetsParams,
  ISubmitDailyTimesheetsParams,
  IBulkUpdateStatusParams
} from '../interfaces/dailyTimesheet';
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND } from '../constants/http';
import { AppError } from '../utils/error';

/**
 * Create a new daily timesheet entry
 */
export const createDailyTimesheet = async (userId: string, data: IDailyTimesheetInput) => {
  const timesheet = new DailyTimesheet({
    userId,
    date: data.date ? new Date(data.date) : new Date(),
    projectId: data.projectId || undefined,
    projectName: data.projectName,
    teamId: data.teamId || undefined,
    teamName: data.teamName,
    taskTitle: data.taskTitle,
    description: data.description,
    plannedHours: data.plannedHours || 0,
    hoursSpent: data.hoursSpent,
    billableType: data.billableType,
    status: TimesheetStatus.Draft,
  });

  await timesheet.save();
  return timesheet;
};

/**
 * List user's daily timesheets with optional filters
 */
export const listDailyTimesheets = async (params: IListDailyTimesheetsParams) => {
  const query: any = { userId: params.userId };

  if (params.startDate || params.endDate) {
    query.date = {};
    if (params.startDate) {
      query.date.$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      query.date.$lte = new Date(params.endDate);
    }
  }

  if (params.status) {
    query.status = params.status;
  }

  if (params.projectId) {
    query.projectId = params.projectId;
  }

  const timesheets = await DailyTimesheet.find(query)
    .sort({ date: -1, createdAt: -1 })
    .populate('projectId', 'projectName')
    .populate('teamId', 'teamName');

  return timesheets;
};

/**
 * Get a single timesheet by ID
 */
export const getDailyTimesheetById = async (userId: string, timesheetId: string) => {
  const timesheet = await DailyTimesheet.findOne({ _id: timesheetId, userId });
  
  if (!timesheet) {
    throw new AppError(NOT_FOUND, 'Timesheet not found');
  }

  return timesheet;
};

/**
 * Update a daily timesheet entry
 */
export const updateDailyTimesheet = async (
  userId: string,
  timesheetId: string,
  data: IDailyTimesheetUpdate
) => {
  const timesheet = await DailyTimesheet.findOne({ _id: timesheetId, userId });

  if (!timesheet) {
    throw new AppError(NOT_FOUND, 'Timesheet not found');
  }

  // Only allow updates to Draft timesheets
  if (timesheet.status !== TimesheetStatus.Draft && !data.status) {
    throw new AppError(FORBIDDEN, 'Cannot update a submitted timesheet');
  }

  // Update fields
  if (data.date) timesheet.date = new Date(data.date);
  if (data.projectId !== undefined) timesheet.projectId = data.projectId as any;
  if (data.projectName) timesheet.projectName = data.projectName;
  if (data.teamId !== undefined) timesheet.teamId = data.teamId as any;
  if (data.teamName !== undefined) timesheet.teamName = data.teamName;
  if (data.taskTitle) timesheet.taskTitle = data.taskTitle;
  if (data.description !== undefined) timesheet.description = data.description;
  if (data.plannedHours !== undefined) timesheet.plannedHours = data.plannedHours;
  if (data.hoursSpent !== undefined) timesheet.hoursSpent = data.hoursSpent;
  if (data.billableType) timesheet.billableType = data.billableType;
  if (data.status) timesheet.status = data.status;
  if (data.rejectionReason !== undefined) timesheet.rejectionReason = data.rejectionReason;

  await timesheet.save();
  return timesheet;
};

/**
 * Delete a daily timesheet entry
 */
export const deleteDailyTimesheet = async (userId: string, timesheetId: string) => {
  const timesheet = await DailyTimesheet.findOne({ _id: timesheetId, userId });

  if (!timesheet) {
    throw new AppError(NOT_FOUND, 'Timesheet not found');
  }

  // Only allow deletion of Draft timesheets
  if (timesheet.status !== TimesheetStatus.Draft) {
    throw new AppError(FORBIDDEN, 'Cannot delete a submitted timesheet');
  }

  await DailyTimesheet.deleteOne({ _id: timesheetId });
  return { message: 'Timesheet deleted successfully' };
};

/**
 * Submit multiple draft timesheets
 */
export const submitDailyTimesheets = async (userId: string, params: ISubmitDailyTimesheetsParams) => {
  const { ids } = params;

  // Find all timesheets
  const timesheets = await DailyTimesheet.find({
    _id: { $in: ids },
    userId,
  });

  if (timesheets.length !== ids.length) {
    throw new AppError(NOT_FOUND, 'One or more timesheets not found');
  }

  // Check if all are Draft
  const nonDraftTimesheets = timesheets.filter(ts => ts.status !== TimesheetStatus.Draft);
  if (nonDraftTimesheets.length > 0) {
    throw new AppError(BAD_REQUEST, 'Only draft timesheets can be submitted');
  }

  // Update status to Pending
  await DailyTimesheet.updateMany(
    { _id: { $in: ids }, userId },
    { $set: { status: TimesheetStatus.Pending } }
  );

  return { message: `${ids.length} timesheet(s) submitted successfully` };
};

/**
 * Bulk update status (for supervisors)
 */
export const bulkUpdateDailyTimesheetStatus = async (
  supervisorId: string,
  params: IBulkUpdateStatusParams
) => {
  const { ids, status, rejectionReason } = params;

  // Validate status
  if (![TimesheetStatus.Approved, TimesheetStatus.Rejected].includes(status)) {
    throw new AppError(BAD_REQUEST, 'Invalid status. Must be Approved or Rejected');
  }

  // TODO: Add supervisor verification logic
  // For now, just update the timesheets

  const updateData: any = { status };
  if (rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  const result = await DailyTimesheet.updateMany(
    { _id: { $in: ids } },
    { $set: updateData }
  );

  return { 
    message: `${result.modifiedCount} timesheet(s) ${status.toLowerCase()} successfully`,
    modifiedCount: result.modifiedCount 
  };
};

/**
 * Get timesheets for supervised users
 */
export const getSupervisedDailyTimesheets = async (supervisorId: string) => {
  // TODO: Implement logic to get supervised user IDs
  // For now, return empty array
  // You'll need to integrate with your User/Team/Project models
  
  return [];
};
