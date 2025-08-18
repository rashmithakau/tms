import Timesheet from '../models/timesheet.model';
import appAssert from '../utils/appAssert';
import { FORBIDDEN, NOT_FOUND } from '../constants/http';

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
  status?: 'Pending' | 'Approved' | 'Rejected';
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
  appAssert(existing.status === 'Pending', FORBIDDEN, 'Only pending timesheets can be updated');
  const doc = await Timesheet.findOneAndUpdate({ _id: id, userId }, update, { new: true });
  return { timesheet: doc };
};

export const deleteMyTimesheet = async (userId: string, id: string) => {
  const existing = await Timesheet.findOne({ _id: id, userId });
  appAssert(existing, NOT_FOUND, 'Timesheet not found');
  appAssert(existing.status === 'Pending', FORBIDDEN, 'Only pending timesheets can be deleted');
  await Timesheet.deleteOne({ _id: id, userId });
  return { success: true };
};



