// services/timesheet.service.ts
import { TimesheetStatus } from '@tms/shared';
import { Timesheet } from '../models/timesheet.model';
import ProjectModel from '../models/project.model';

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
  status: TimesheetStatus.Approved | TimesheetStatus.Rejected,
  rejectionReason?: string,
  retryCount: number = 0
) => {
  console.log('Starting updateDailyTimesheetStatus:', {
    supervisorId,
    timesheetId,
    categoryIndex,
    itemIndex,
    dayIndices,
    status,
    retryCount
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

    // Verify the timesheet belongs to a supervised user AND the specific item is for a supervised project
    const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });
    const supervisedProjectIds = supervisedProjects.map(p => p._id.toString());
    const supervisedUserIds = Array.from(
      new Set(
        supervisedProjects.flatMap(p => p.employees?.map(e => e.toString()) || [])
      )
    );
    
    // Check if timesheet owner is supervised
    const timesheetUserId = timesheet.userId._id ? timesheet.userId._id.toString() : timesheet.userId.toString();
    if (!supervisedUserIds.includes(timesheetUserId)) {
      throw new Error('Unauthorized: You can only approve timesheets from your supervised employees');
    }
    
    // Check if the specific item is for a project the supervisor supervises
    const item = timesheet.data[categoryIndex].items[itemIndex];
    if (item.projectId && !supervisedProjectIds.includes(item.projectId)) {
      throw new Error('Unauthorized: You can only approve timesheet items for projects you supervise');
    }
    
    // Validate indices
    if (categoryIndex < 0 || categoryIndex >= timesheet.data.length) {
      throw new Error(`Invalid category index: ${categoryIndex}. Available categories: ${timesheet.data.length}`);
    }
    
    const category = timesheet.data[categoryIndex];
    console.log('Category found:', { category: category.category, itemsCount: category.items.length });
    
    if (itemIndex < 0 || itemIndex >= category.items.length) {
      throw new Error(`Invalid item index: ${itemIndex}. Available items in category '${category.category}': ${category.items.length}`);
    }
    
    const categoryItem = category.items[itemIndex];
    console.log('Item before update:', {
      work: categoryItem.work,
      projectId: categoryItem.projectId,
      dailyStatus: categoryItem.dailyStatus,
      dailyStatusLength: categoryItem.dailyStatus?.length
    });
    
    // Ensure dailyStatus array exists and has correct length
    if (!categoryItem.dailyStatus || categoryItem.dailyStatus.length !== 7) {
      console.log('Initializing missing or invalid dailyStatus array for item:', categoryItem);
      categoryItem.dailyStatus = Array(7).fill(TimesheetStatus.Pending);
    }
    
    // Update the specified days
    dayIndices.forEach(dayIndex => {
      if (dayIndex >= 0 && dayIndex < 7) {
        categoryItem.dailyStatus[dayIndex] = status;
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
      
      // If rejected and reason provided, save it
      if (timesheet.status === TimesheetStatus.Rejected && rejectionReason) {
        timesheet.rejectionReason = rejectionReason;
      }
    }
    
    // Save the timesheet
    const savedTimesheet = await timesheet.save();
    
    console.log('Daily status updated successfully:', {
      timesheetId,
      updatedDailyStatus: savedTimesheet.data[categoryIndex].items[itemIndex].dailyStatus,
      overallStatus: savedTimesheet.status
    });
    
    return savedTimesheet;
  } catch (error: any) {
    console.error('Error updating daily timesheet status:', error);
    
    // Handle version conflicts with retry logic
    if (error.name === 'VersionError' && retryCount < 3) {
      console.log(`Retrying update due to version conflict (attempt ${retryCount + 1}/3)`);
      // Wait a small random time before retrying to reduce contention
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      return updateDailyTimesheetStatus(supervisorId, timesheetId, categoryIndex, itemIndex, dayIndices, status, rejectionReason, retryCount + 1);
    }
    
    throw error;
  }
};

// --- Batch update daily status of multiple timesheet items ---
export const batchUpdateDailyTimesheetStatus = async (
  supervisorId: string,
  updates: Array<{
    timesheetId: string;
    categoryIndex: number;
    itemIndex: number;
    dayIndices: number[];
    status: TimesheetStatus.Approved | TimesheetStatus.Rejected;
    rejectionReason?: string;
  }>
) => {
  console.log('Starting batchUpdateDailyTimesheetStatus:', { supervisorId, updatesCount: updates.length });
  console.log('Updates received:', JSON.stringify(updates, null, 2));

  // Group updates by timesheetId to process each timesheet once
  const groupedUpdates = new Map<string, typeof updates>();
  updates.forEach(update => {
    if (!groupedUpdates.has(update.timesheetId)) {
      groupedUpdates.set(update.timesheetId, []);
    }
    groupedUpdates.get(update.timesheetId)!.push(update);
  });

  const results = [];

  // Get supervisor's projects once for authorization
  const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });
  const supervisedProjectIds = supervisedProjects.map(p => p._id.toString());
  const supervisedUserIds = Array.from(
    new Set(
      supervisedProjects.flatMap(p => p.employees?.map(e => e.toString()) || [])
    )
  );

  console.log('Authorization data:', {
    supervisorId,
    supervisedProjectsCount: supervisedProjects.length,
    supervisedProjectIds,
    supervisedUserIds
  });

  // Process each timesheet sequentially to avoid version conflicts
  for (const [timesheetId, timesheetUpdates] of groupedUpdates) {
    try {
      console.log('Processing timesheet:', { timesheetId, updatesCount: timesheetUpdates.length });
      
      // Validate ObjectId format
      if (!timesheetId || timesheetId.length !== 24) {
        const error = `Invalid timesheet ID format: ${timesheetId}`;
        console.error(error);
        throw new Error(error);
      }

      // Find the timesheet
      const timesheet = await Timesheet.findById(timesheetId)
        .populate('userId', 'firstName lastName email');
      
      if (!timesheet) {
        const error = `Timesheet not found: ${timesheetId}`;
        console.error(error);
        throw new Error(error);
      }

      console.log('Timesheet found:', {
        timesheetId,
        userId: timesheet.userId,
        status: timesheet.status,
        dataLength: timesheet.data?.length || 0
      });

      // Verify the timesheet belongs to a supervised user
      const timesheetUserId = timesheet.userId._id ? timesheet.userId._id.toString() : timesheet.userId.toString();
      console.log('Authorization check:', {
        timesheetUserId,
        supervisedUserIds,
        isIncluded: supervisedUserIds.includes(timesheetUserId)
      });
      
      if (!supervisedUserIds.includes(timesheetUserId)) {
        const error = 'Unauthorized: You can only approve timesheets from your supervised employees';
        console.error(error, {
          timesheetUserId,
          supervisedUserIds
        });
        throw new Error(error);
      }

      // Pre-validate all project items before making any changes
      for (const update of timesheetUpdates) {
        const { categoryIndex, itemIndex } = update;
        
        console.log('Validating update:', { timesheetId, categoryIndex, itemIndex });
        
        if (categoryIndex < 0 || categoryIndex >= timesheet.data.length) {
          console.error('Invalid category index:', { categoryIndex, availableCategories: timesheet.data.length });
          throw new Error(`Invalid category index: ${categoryIndex}`);
        }
        
        const category = timesheet.data[categoryIndex];
        if (itemIndex < 0 || itemIndex >= category.items.length) {
          console.error('Invalid item index:', { itemIndex, availableItems: category.items.length });
          throw new Error(`Invalid item index: ${itemIndex}`);
        }
        
        const item = category.items[itemIndex];
        
        console.log('Item validation:', {
          timesheetId,
          categoryIndex,
          itemIndex,
          itemProjectId: item.projectId,
          supervisedProjectIds,
          isProjectItem: !!item.projectId,
          isAuthorized: !item.projectId || supervisedProjectIds.includes(item.projectId)
        });
        
        // Check if the specific item is for a project the supervisor supervises
        if (item.projectId && !supervisedProjectIds.includes(item.projectId)) {
          console.error('Authorization failed:', {
            itemProjectId: item.projectId,
            supervisedProjectIds,
            message: 'You can only approve timesheet items for projects you supervise'
          });
          throw new Error('Unauthorized: You can only approve timesheet items for projects you supervise');
        }
      }

      // Apply all updates for this timesheet
      timesheetUpdates.forEach((update, updateIndex) => {
        const { categoryIndex, itemIndex, dayIndices, status, rejectionReason } = update;
        
        console.log(`Applying update ${updateIndex + 1}/${timesheetUpdates.length}:`, {
          timesheetId,
          categoryIndex,
          itemIndex,
          dayIndices,
          status
        });
        
        // Validate indices
        if (categoryIndex < 0 || categoryIndex >= timesheet.data.length) {
          const error = `Invalid category index: ${categoryIndex}. Available: 0-${timesheet.data.length - 1}`;
          console.error(error);
          throw new Error(error);
        }
        
        const category = timesheet.data[categoryIndex];
        if (itemIndex < 0 || itemIndex >= category.items.length) {
          const error = `Invalid item index: ${itemIndex}. Available: 0-${category.items.length - 1}`;
          console.error(error);
          throw new Error(error);
        }
        
        const item = category.items[itemIndex];
        
        console.log('Item details:', {
          categoryName: category.category,
          itemWork: item.work,
          itemProjectId: item.projectId,
          currentDailyStatus: item.dailyStatus
        });
        
        // Ensure dailyStatus array exists
        if (!item.dailyStatus || item.dailyStatus.length !== 7) {
          console.log('Initializing dailyStatus array for item');
          item.dailyStatus = Array(7).fill(TimesheetStatus.Pending);
        }
        
        // Update the specified days
        dayIndices.forEach((dayIndex, dayIdx) => {
          if (dayIndex >= 0 && dayIndex < 7) {
            console.log(`Updating day ${dayIndex} from ${item.dailyStatus[dayIndex]} to ${status}`);
            item.dailyStatus[dayIndex] = status;
          } else {
            const error = `Invalid day index: ${dayIndex}. Must be 0-6`;
            console.error(error);
            throw new Error(error);
          }
        });
        
        console.log('Updated dailyStatus:', item.dailyStatus);
      });
      
      // Mark as modified
      timesheet.markModified('data');
      
      console.log('Checking completion state...');
      
      // Check if all days for all items are now approved/rejected
      const allItemsProcessed = timesheet.data.every(cat => 
        cat.items.every(itm => 
          itm.dailyStatus.every(dayStatus => 
            dayStatus === TimesheetStatus.Approved || dayStatus === TimesheetStatus.Rejected
          )
        )
      );
      
      console.log('All items processed:', allItemsProcessed);
      
      // If all items are processed, update overall status
      if (allItemsProcessed) {
        const allApproved = timesheet.data.every(cat => 
          cat.items.every(itm => 
            itm.dailyStatus.every(dayStatus => dayStatus === TimesheetStatus.Approved)
          )
        );
        
        console.log('All approved:', allApproved);
        
        timesheet.status = allApproved ? TimesheetStatus.Approved : TimesheetStatus.Rejected;
        
        // If rejected and reason provided, save it
        if (timesheet.status === TimesheetStatus.Rejected) {
          const rejectionUpdate = timesheetUpdates.find(u => u.rejectionReason);
          if (rejectionUpdate?.rejectionReason) {
            timesheet.rejectionReason = rejectionUpdate.rejectionReason;
            console.log('Added rejection reason:', rejectionUpdate.rejectionReason);
          }
        }
      }
      
      console.log('Saving timesheet with status:', timesheet.status);
      
      // Save the timesheet
      const savedTimesheet = await timesheet.save();
      console.log('Timesheet saved successfully:', savedTimesheet._id);
      results.push(savedTimesheet);
      
    } catch (error: any) {
      console.error(`Error updating timesheet ${timesheetId}:`, {
        error: error.message,
        stack: error.stack,
        timesheetId,
        supervisorId
      });
      throw error; // Re-throw to be handled by controller
    }
  }

  console.log('Batch update completed successfully');
  return results;
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
