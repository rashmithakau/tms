import Timesheet from '../models/timesheet.model';
import appAssert from '../utils/appAssert';
import { FORBIDDEN, NOT_FOUND } from '../constants/http';
import { TimesheetStatus } from '@tms/shared';
import ProjectModel from '../models/project.model';

export type CreateTimesheetParams = {
  userId: string;
  date: Date;
  projectId: string;
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
    projectId: params.projectId,
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

export const listSupervisedTimesheets = async (supervisorId: string) => {
  // Find all projects where the user is the supervisor
  const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });

  // Collect all employees from these projects, excluding the supervisor themself and deduplicating
  const employeeIdStrings = Array.from(
    new Set(
      supervisedProjects
        .flatMap(project => project.employees || [])
        .map(empId => empId?.toString())
        .filter((id): id is string => Boolean(id))
    )
  ).filter(id => id !== supervisorId);

  if (employeeIdStrings.length === 0) {
    return { timesheets: [] };
  }

  // Get timesheets for these employees only
  const data = await Timesheet.find({
    userId: { $in: employeeIdStrings },
  })
    .populate('projectId', 'projectName')
    .populate('userId', 'firstName lastName email contactNumber designation')
    .sort({ date: -1, createdAt: -1 });

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

export const updateSupervisedTimesheetsStatus = async (
  supervisorId: string,
  ids: string[],
  status: TimesheetStatus.Approved | TimesheetStatus.Rejected
) => {
  // Derive supervised employee ids
  const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });
  const employeeIdStrings = Array.from(
    new Set(
      supervisedProjects
        .flatMap(project => project.employees || [])
        .map(empId => empId?.toString())
        .filter((id): id is string => Boolean(id))
    )
  ).filter(id => id !== supervisorId);

  if (employeeIdStrings.length === 0 || ids.length === 0) {
    return { matched: 0, modified: 0 };
  }

  const result = await Timesheet.updateMany(
    {
      _id: { $in: ids },
      userId: { $in: employeeIdStrings },
      status: TimesheetStatus.Pending,
    },
    { $set: { status } }
  );

  return { matched: (result as any).matchedCount ?? 0, modified: (result as any).modifiedCount ?? 0 };
};



