import { TimesheetStatus } from '@tms/shared';
import appAssert from '../utils/appAssert';
import {  UNAUTHORIZED, BAD_REQUEST, NOT_FOUND } from '../constants/http';
import { Timesheet } from '../models/timesheet.model';
import RejectReason from '../models/rejectReason.model';
import ProjectModel from '../models/project.model';
import NotificationModel from '../models/notification.model';
import { socketService } from '../config/socket';

interface ITimesheetItem {
  work?: string;
  projectId?: string; 
  hours: string[]; 
  descriptions: string[]; 
}

export interface ITimesheetCategory {
  category: string; 
  items: ITimesheetItem[]; 
}

export interface CreateTimesheetParams {
  userId: string;
  weekStartDate: string | Date;
  data: ITimesheetCategory[];
}

export type UpdateTimesheetParams = Partial<CreateTimesheetParams> & {
  status?: TimesheetStatus;
};

export const createTimesheet = async (params: CreateTimesheetParams) => {

  const dataWithDailyStatus = params.data.map(category => ({
    ...category,
    items: category.items.map(item => ({
      ...item,
      dailyStatus: Array(7).fill(TimesheetStatus.Draft)
    }))
  }));

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

// --- Submit draft timesheets ---
export const submitDraftTimesheets = async (userId: string, ids: string[]) => {
  const results = [];
  
  for (const id of ids) {
    try {
      const timesheet = await Timesheet.findOne({
        _id: id,
        userId,
        $or: [
          { status: TimesheetStatus.Draft },
          { status: TimesheetStatus.Rejected }
        ]
      });
      
      if (!timesheet) {
        console.log('Timesheet not found or not Draft/Rejected:', id);
        continue;
      }
      
      // Store the original status before making changes
      const originalStatus = timesheet.status;
      
      timesheet.data.forEach((category) => {
        category.items.forEach((item) => {
          if (originalStatus === TimesheetStatus.Draft) {
            // For Draft timesheets, set all daily statuses to Pending
            item.dailyStatus = Array(7).fill(TimesheetStatus.Pending);
          } else if (originalStatus === TimesheetStatus.Rejected) {
            // For Rejected timesheets, only update Rejected daily statuses to Pending
            if (!item.dailyStatus || item.dailyStatus.length !== 7) {
              item.dailyStatus = Array(7).fill(TimesheetStatus.Pending);
            } else {
              item.dailyStatus = item.dailyStatus.map((status: TimesheetStatus) => 
                status === TimesheetStatus.Rejected ? TimesheetStatus.Pending : status
              );
            }
          }
        });
      });
      
      timesheet.markModified('data');
      timesheet.status = TimesheetStatus.Pending;
      const savedTimesheet = await timesheet.save();
      
      results.push(savedTimesheet);
    } catch (error) {
      console.error('Error updating timesheet', id, ':', error);
    }
  }
  
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
) => {

  appAssert(timesheetId && timesheetId.length === 24, BAD_REQUEST, `Invalid timesheet ID format: ${timesheetId}`);

  // Find the timesheet and verify supervisor has access
  const timesheet = await Timesheet.findById(timesheetId)
    .populate('userId', 'firstName lastName email');
  appAssert(timesheet, NOT_FOUND, 'Timesheet not found');

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
  appAssert(supervisedUserIds.includes(timesheetUserId), UNAUTHORIZED, 'Unauthorized: You can only approve timesheets from your supervised employees');

  // Check if the specific item is for a project the supervisor supervises
  const item = timesheet.data[categoryIndex].items[itemIndex];
  appAssert(!item.projectId || supervisedProjectIds.includes(item.projectId), UNAUTHORIZED, 'Unauthorized: You can only approve timesheet items for projects you supervise');

  // Validate indices
  appAssert(categoryIndex >= 0 && categoryIndex < timesheet.data.length, BAD_REQUEST, `Invalid category index: ${categoryIndex}. Available categories: ${timesheet.data.length}`);
  const category = timesheet.data[categoryIndex];
  appAssert(itemIndex >= 0 && itemIndex < category.items.length, BAD_REQUEST, `Invalid item index: ${itemIndex}. Available items in category '${category.category}': ${category.items.length}`);

  const categoryItem = category.items[itemIndex];

  if (!categoryItem.dailyStatus || categoryItem.dailyStatus.length !== 7) {
    categoryItem.dailyStatus = Array(7).fill(TimesheetStatus.Pending);
  }

  // Update the specified days
  dayIndices.forEach(dayIndex => {
    if (dayIndex >= 0 && dayIndex < 7) {
      categoryItem.dailyStatus[dayIndex] = status;
    }
  });

  // Save rejection reason immediately for each rejected item
  if (status === TimesheetStatus.Rejected && rejectionReason) {
    try {
      await RejectReason.create({
        reason: rejectionReason,
        timesheet_id: timesheet._id.toString(),
        project_id: categoryItem.projectId || '',
        rejected_days_indexes: dayIndices,
      });
      console.log('RejectReason saved for individual rejection:', {
        reason: rejectionReason,
        timesheet_id: timesheet._id.toString(),
        project_id: categoryItem.projectId || '',
        rejected_days_indexes: dayIndices,
      });
    } catch (err) {
      console.error('Failed to save RejectReason for individual rejection:', err);
    }
  }

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

    // Set overall rejection reason if the overall timesheet status is rejected
    if (timesheet.status === TimesheetStatus.Rejected && rejectionReason) {
      timesheet.rejectionReason = rejectionReason;
    }
  }

  const savedTimesheet = await timesheet.save();

  // Emit detailed rejection notification for single-item flow
  try {
    if (status === TimesheetStatus.Rejected) {
      const weekStart = new Date(savedTimesheet.weekStartDate);
      const item: any = savedTimesheet.data[categoryIndex].items[itemIndex];
      const projectId = item.projectId || '';
      
      // Fetch the actual project name from the database
      let projectName = 'Project'; // Default fallback
      if (projectId) {
        try {
          const project = await ProjectModel.findById(projectId);
          projectName = project?.projectName || 'Project';
        } catch (error) {
          console.error('Error fetching project name:', error);
        }
      }
      
      const rejectedDates = dayIndices.map((d) => {
        const date = new Date(weekStart);
        date.setUTCDate(date.getUTCDate() + d);
        return date.toISOString().split('T')[0];
      });

      const notif = await NotificationModel.create({
        userId: (savedTimesheet.userId as any)._id || savedTimesheet.userId,
        type: 'TimesheetRejected',
        title: `Timesheet Rejected - ${projectName}`,
        message: `Timesheet rejected for ${rejectedDates.join(', ')}${rejectionReason ? ` - Reason: ${rejectionReason}` : ''}`,
        projectId,
        projectName,
        rejectedDates,
        reason: rejectionReason,
      });

      const targetUserId = (((savedTimesheet.userId as any)._id) || savedTimesheet.userId).toString();
      socketService.emitToUser(targetUserId, 'notification', {
        _id: notif._id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        projectId: notif.projectId,
        projectName: notif.projectName,
        rejectedDates: notif.rejectedDates,
        reason: notif.reason,
        createdAt: notif.createdAt,
        isRead: notif.isRead,
      });
    }
  } catch (e) {
    console.error('Failed to create/emit single rejection notification', e);
  }

  return savedTimesheet;
};

//Batch update daily status of multiple timesheet items 
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

  for (const [timesheetId, timesheetUpdates] of groupedUpdates) {
    try {
      
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


      // Verify the timesheet belongs to a supervised user
      const timesheetUserId = timesheet.userId._id ? timesheet.userId._id.toString() : timesheet.userId.toString();
      
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
      for (const update of timesheetUpdates) {
        const { categoryIndex, itemIndex, dayIndices, status, rejectionReason } = update;
        
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
        
        
        // Ensure dailyStatus array exists
        if (!item.dailyStatus || item.dailyStatus.length !== 7) {
          console.log('Initializing dailyStatus array for item');
          item.dailyStatus = Array(7).fill(TimesheetStatus.Pending);
        }
        
        // Update the specified days
        dayIndices.forEach((dayIndex) => {
          if (dayIndex >= 0 && dayIndex < 7) {
            console.log(`Updating day ${dayIndex} from ${item.dailyStatus[dayIndex]} to ${status}`);
            item.dailyStatus[dayIndex] = status;
          } else {
            const error = `Invalid day index: ${dayIndex}. Must be 0-6`;
            console.error(error);
            throw new Error(error);
          }
        });

        if(status ===TimesheetStatus.Rejected) {
          console.log('Rejection timeshet recieved');
          timesheet.status=TimesheetStatus.Rejected;
        }
        
        // Save rejection reason immediately for each rejected item
        if (status === TimesheetStatus.Rejected && rejectionReason) {
          try {
            await RejectReason.create({
              reason: rejectionReason,
              timesheet_id: timesheet._id.toString(),
              project_id: item.projectId || '',
              rejected_days_indexes: dayIndices,
            });
            console.log('RejectReason saved for individual rejection:', {
              reason: rejectionReason,
              timesheet_id: timesheet._id.toString(),
              project_id: item.projectId || '',
              rejected_days_indexes: dayIndices,
            });
          } catch (err) {
            console.error('Failed to save RejectReason for individual rejection:', err);
          }
        }
        
        console.log('Updated dailyStatus:', item.dailyStatus);
      }
      
      // Mark as modified
      timesheet.markModified('data');
      
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
        
        // Set overall rejection reason if the overall timesheet status is rejected
        if (timesheet.status === TimesheetStatus.Rejected) {
          const rejectionUpdate = timesheetUpdates.find(u => u.rejectionReason);
          if (rejectionUpdate?.rejectionReason) {
            timesheet.rejectionReason = rejectionUpdate.rejectionReason;
          }
        }
      }
      
      const savedTimesheet = await timesheet.save();
      results.push(savedTimesheet);

      // Emit rejection notifications per updated item (if any rejection occurred)
      const hadRejection = timesheetUpdates.some(u => u.status === TimesheetStatus.Rejected);
      if (hadRejection) {
        try {
          const weekStart = new Date(timesheet.weekStartDate);
          const rejectedSummaries: Array<{ projectId?: string; projectName?: string; rejectedDates: string[]; reason?: string; }> = [];

          for (const u of timesheetUpdates.filter(u => u.status === TimesheetStatus.Rejected)) {
            const item = timesheet.data[u.categoryIndex].items[u.itemIndex] as any;
            const projectId = item.projectId;
            
            // Fetch the actual project name from the database
            let projectName = undefined;
            if (projectId) {
              try {
                const project = await ProjectModel.findById(projectId);
                projectName = project?.projectName;
              } catch (error) {
                console.error('Error fetching project name for batch update:', error);
              }
            }
            
            const rejectedDates = u.dayIndices.map((d) => {
              const date = new Date(weekStart);
              date.setUTCDate(date.getUTCDate() + d);
              return date.toISOString().split('T')[0];
            });
            rejectedSummaries.push({ projectId, projectName, rejectedDates, reason: u.rejectionReason });
          }

          // Create a single consolidated message
          const allDates = Array.from(new Set(rejectedSummaries.flatMap(s => s.rejectedDates))).sort();
          const firstProjectName = rejectedSummaries.find(s => !!s.projectName)?.projectName || 'Project';
          const reasons = Array.from(new Set(rejectedSummaries.map(s => s.reason).filter(Boolean))) as string[];
          const message = `Timesheet rejected for ${allDates.join(', ')}${reasons.length ? ` - Reason: ${reasons.join('; ')}` : ''}`;

          const notif = await NotificationModel.create({
            userId: (timesheet.userId as any)._id || timesheet.userId,
            type: 'TimesheetRejected',
            title: `Timesheet Rejected - ${firstProjectName}`,
            message,
            projectId: rejectedSummaries[0]?.projectId,
            projectName: firstProjectName,
            rejectedDates: allDates,
            reason: reasons[0],
          });

          // Emit to the employee in real-time
          const targetUserId = ((timesheet.userId as any)._id || timesheet.userId).toString();
          socketService.emitToUser(targetUserId, 'notification', {
            _id: notif._id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            projectId: notif.projectId,
            projectName: notif.projectName,
            rejectedDates: notif.rejectedDates,
            reason: notif.reason,
            createdAt: notif.createdAt,
            isRead: notif.isRead,
          });
        } catch (e) {
          console.error('Failed to create/emit rejection notification', e);
        }
      }
      
    } catch (error: any) {
      throw error; 
    }
  }

  return results;
};


