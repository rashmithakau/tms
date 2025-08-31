// services/timesheet.service.ts
import { TimesheetStatus } from '@tms/shared';
import { Timesheet } from '../models/timesheet.model';

interface ITimesheetItem {
  work?: string;
  projectId?: string; // only for Project category
  hours: string[]; // e.g. ["08.00", "00.00", ...]
  descriptions: string[]; // e.g. ["dev work", "", ...]
}

export interface ITimesheetCategory {
  category: string; // e.g. "Project" | "Absence"
  items: ITimesheetItem[]; // list of tasks/absences for this category
}

export interface CreateTimesheetParams {
  userId: string;
  weekStartDate: string | Date;
  data: ITimesheetCategory[];
}

export type UpdateTimesheetParams = Partial<CreateTimesheetParams> & {
  status?: TimesheetStatus;
};

// --- Create a new timesheet ---
export const createTimesheet = async (params: CreateTimesheetParams) => {
  // Ensure each item in each category has dailyStatus set to Draft for 7 days

  const dataWithDailyStatus = params.data.map(category => ({
    ...category,
    items: category.items.map(item => ({
      ...item,
      dailyStatus: Array(7).fill(TimesheetStatus.Draft)
    }))
  }));

  console.log(params.weekStartDate+" is week start date in service");

  // Normalize weekStartDate to midnight UTC
  let weekStartDate = new Date(params.weekStartDate);
  weekStartDate.setUTCHours(0, 0, 0, 0);

  const doc = await Timesheet.create({
    userId: params.userId,
    weekStartDate,
    status: TimesheetStatus.Draft,
    data: dataWithDailyStatus,
  });
  return { timesheet: doc };
};

// // --- List my timesheets ---
// export const listMyTimesheets = async (userId: string) => {
//   const data = await Timesheet.find({ userId }).sort({ weekStartDate: -1 });
//   return { timesheets: data };
// };

// // --- List supervised timesheets ---
// export const listSupervisedTimesheets = async (supervisorId: string) => {
//   const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });

//   const employeeIds = Array.from(
//     new Set(
//       supervisedProjects
//         .flatMap(p => p.employees || [])
//         .map(id => id?.toString())
//         .filter((id): id is string => !!id)
//     )
//   ).filter(id => id !== supervisorId);

//   if (employeeIds.length === 0) return { timesheets: [] };

//   const data = await Timesheet.find({
//     userId: { $in: employeeIds },
//   })
//     .populate('categories.items.projectId', 'projectName')
//     .populate('userId', 'firstName lastName email contactNumber designation')
//     .sort({ weekStartDate: -1, createdAt: -1 });

//   return { timesheets: data };
// };

// // --- Update my timesheet ---
// export const updateMyTimesheet = async (userId: string, id: string, update: UpdateTimesheetParams) => {
//   const existing = await Timesheet.findOne({ _id: id, userId });
//   appAssert(existing, NOT_FOUND, 'Timesheet not found');
//   appAssert(existing.status === TimesheetStatus.Draft, FORBIDDEN, 'Only draft timesheets can be updated');

//   const doc = await Timesheet.findOneAndUpdate({ _id: id, userId }, update, { new: true });
//   return { timesheet: doc };
// };

// // --- Delete my timesheet ---
// export const deleteMyTimesheet = async (userId: string, id: string) => {
//   const existing = await Timesheet.findOne({ _id: id, userId });
//   appAssert(existing, NOT_FOUND, 'Timesheet not found');
//   appAssert(existing.status === TimesheetStatus.Draft, FORBIDDEN, 'Only draft timesheets can be deleted');

//   await Timesheet.deleteOne({ _id: id, userId });
//   return { success: true };
// };

// --- Submit draft timesheets ---
export const submitDraftTimesheets = async (userId: string, ids: string[]) => {
  const result = await Timesheet.updateMany(
    { _id: { $in: ids }, userId, status: TimesheetStatus.Draft },
    { $set: { status: TimesheetStatus.Pending } }
  );

  return { matched: (result as any).matchedCount, modified: (result as any).modifiedCount };
};

// // --- Update status of supervised timesheets ---
// export const updateSupervisedTimesheetsStatus = async (
//   supervisorId: string,
//   ids: string[],
//   status: TimesheetStatus.Approved | TimesheetStatus.Rejected
// ) => {
//   const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });

//   const employeeIds = Array.from(
//     new Set(
//       supervisedProjects
//         .flatMap(p => p.employees || [])
//         .map(id => id?.toString())
//         .filter((id): id is string => !!id)
//     )
//   ).filter(id => id !== supervisorId);

//   if (employeeIds.length === 0 || ids.length === 0) return { matched: 0, modified: 0 };

//   const result = await Timesheet.updateMany(
//     {
//       _id: { $in: ids },
//       userId: { $in: employeeIds },
//       status: TimesheetStatus.Pending,
//     },
//     { $set: { status } }
//   );

//   return { matched: (result as any).matchedCount ?? 0, modified: (result as any).modifiedCount ?? 0 };
// };
