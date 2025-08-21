import Timesheet from '../models/timesheet.model';
import appAssert from '../utils/appAssert';
import { FORBIDDEN, NOT_FOUND } from '../constants/http';
import { TimesheetStatus } from '@tms/shared';

export type CreateTimesheetParams = {
  userId: string;
  date: Date;
  projectName: string;
  taskTitle: string;
  description?: string;
  plannedHours?: number;
  hoursSpent?: number;
  billableType: 'Billable' | 'Non Billable';
};

export type UpdateTimesheetParams = Partial<Omit<CreateTimesheetParams, 'userId'>> & {
  status?: TimesheetStatus;
};

export const createTimesheet = async (params: CreateTimesheetParams) => {
  const doc = await Timesheet.create({
    userId: params.userId,
    date: params.date,
    projectName: params.projectName,
    taskTitle: params.taskTitle,
    description: params.description || '',
    plannedHours: params.plannedHours ?? 0,
    hoursSpent: params.hoursSpent ?? 0,
    billableType: params.billableType,
    // Status will default to Draft from the model
  });
  return { timesheet: doc };
};

export const listMyTimesheets = async (userId: string) => {
  const data = await Timesheet.findByUser(userId);
  return { timesheets: data };
};

export const updateMyTimesheet = async (userId: string, id: string, update: UpdateTimesheetParams) => {
  const existing = await Timesheet.findOne({ _id: id, userId });
  appAssert(existing, NOT_FOUND, 'Timesheet not found');
  appAssert(existing.status === TimesheetStatus.Draft, FORBIDDEN, 'Only draft timesheets can be updated');
  const doc = await Timesheet.findOneAndUpdate({ _id: id, userId }, update, { new: true });
  return { timesheet: doc };
};

export const deleteMyTimesheet = async (userId: string, id: string) => {
  const existing = await Timesheet.findOne({ _id: id, userId });
  appAssert(existing, NOT_FOUND, 'Timesheet not found');
  appAssert(existing.status === TimesheetStatus.Draft, FORBIDDEN, 'Only draft timesheets can be deleted');
  await Timesheet.deleteOne({ _id: id, userId });
  return { success: true };
};

export const submitDraftTimesheets = async (userId: string, ids: string[]) => {
  // Only transition Draft -> Pending, and only for the owner's docs
  const result = await Timesheet.updateMany(
    { _id: { $in: ids }, userId, status: TimesheetStatus.Draft },
    { $set: { status: TimesheetStatus.Pending } }
  );
  return { matched: (result as any).matchedCount, modified: (result as any).modifiedCount };
};



