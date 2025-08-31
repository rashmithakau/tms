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
  console.log('Starting submitDraftTimesheets for user:', userId, 'ids:', ids);
  
  const results = [];
  
  for (const id of ids) {
    try {
      // Find the timesheet
      const timesheet = await Timesheet.findOne({
        _id: id,
        userId,
        status: TimesheetStatus.Draft
      });
      
      if (!timesheet) {
        console.log('Timesheet not found or not Draft:', id);
        continue;
      }
      
      console.log('Processing timesheet:', id);
      console.log('Before update - dailyStatus:', timesheet.data[0]?.items[0]?.dailyStatus);
      
      // Modify the timesheet data directly
      timesheet.data.forEach((category, categoryIndex) => {
        category.items.forEach((item, itemIndex) => {
          console.log(`Updating category ${categoryIndex}, item ${itemIndex}`);
          console.log('Original dailyStatus:', item.dailyStatus);
          
          // Set all 7 days to Pending
          item.dailyStatus = Array(7).fill(TimesheetStatus.Pending);
          console.log('New dailyStatus:', item.dailyStatus);
        });
      });
      
      // Mark the nested documents as modified to ensure Mongoose tracks the changes
      timesheet.markModified('data');
      
      // Update the overall status
      timesheet.status = TimesheetStatus.Pending;
      
      console.log('About to save timesheet with data:', JSON.stringify(timesheet.data, null, 2));
      
      // Save the modified timesheet
      const savedTimesheet = await timesheet.save();
      
      console.log('Timesheet saved successfully:', id);
      console.log('Final saved dailyStatus:', savedTimesheet.data[0]?.items[0]?.dailyStatus);
      
      // Verify the saved data by fetching again
      const verifyTimesheet = await Timesheet.findById(id);
      console.log('Verification - dailyStatus from DB:', verifyTimesheet?.data[0]?.items[0]?.dailyStatus);
      
      results.push(savedTimesheet);
    } catch (error) {
      console.error('Error updating timesheet', id, ':', error);
    }
  }
  
  console.log('Submission completed. Updated:', results.length, 'out of', ids.length);
  return { matched: ids.length, modified: results.length };
};

// --- Update daily status of specific timesheet items ---
export const updateDailyTimesheetStatus = async (
  supervisorId: string, 
  timesheetId: string, 
  categoryIndex: number, 
  itemIndex: number, 
  dayIndices: number[], 
  status: TimesheetStatus.Approved | TimesheetStatus.Rejected
) => {
  console.log('Starting updateDailyTimesheetStatus:', {
    supervisorId,
    timesheetId,
    categoryIndex,
    itemIndex,
    dayIndices,
    status
  });

  try {
    // Validate ObjectId format
    if (!timesheetId || timesheetId.length !== 24) {
      throw new Error(`Invalid timesheet ID format: ${timesheetId}`);
    }

    // Find the timesheet and verify supervisor has access
    const timesheet = await Timesheet.findById(timesheetId)
      .populate('userId', 'firstName lastName email');
    
    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    // Verify the timesheet belongs to a supervised user
    // TODO: Add proper supervisor verification logic here
    
    // Validate indices
    if (categoryIndex < 0 || categoryIndex >= timesheet.data.length) {
      throw new Error('Invalid category index');
    }
    
    const category = timesheet.data[categoryIndex];
    if (itemIndex < 0 || itemIndex >= category.items.length) {
      throw new Error('Invalid item index');
    }
    
    const item = category.items[itemIndex];
    
    // Update the specified days
    dayIndices.forEach(dayIndex => {
      if (dayIndex >= 0 && dayIndex < 7) {
        item.dailyStatus[dayIndex] = status;
      }
    });
    
    // Mark the nested documents as modified
    timesheet.markModified('data');
    
    // Check if all days for all items are now approved/rejected
    const allItemsProcessed = timesheet.data.every(cat => 
      cat.items.every(itm => 
        itm.dailyStatus.every(dayStatus => 
          dayStatus === TimesheetStatus.Approved || dayStatus === TimesheetStatus.Rejected
        )
      )
    );
    
    // If all items are processed, update overall status
    if (allItemsProcessed) {
      const allApproved = timesheet.data.every(cat => 
        cat.items.every(itm => 
          itm.dailyStatus.every(dayStatus => dayStatus === TimesheetStatus.Approved)
        )
      );
      
      timesheet.status = allApproved ? TimesheetStatus.Approved : TimesheetStatus.Rejected;
    }
    
    // Save the timesheet
    const savedTimesheet = await timesheet.save();
    
    console.log('Daily status updated successfully:', {
      timesheetId,
      updatedDailyStatus: savedTimesheet.data[categoryIndex].items[itemIndex].dailyStatus,
      overallStatus: savedTimesheet.status
    });
    
    return savedTimesheet;
  } catch (error) {
    console.error('Error updating daily timesheet status:', error);
    throw error;
  }
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
