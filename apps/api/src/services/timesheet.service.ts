import { TimesheetStatus, NotificationType } from '@tms/shared';
import { appAssert } from '../utils/validation';
import { UNAUTHORIZED, BAD_REQUEST, NOT_FOUND } from '../constants/http';
import { Timesheet } from '../models/timesheet.model';
import RejectReason from '../models/rejectReason.model';
import ProjectModel from '../models/project.model';
import TeamModel from '../models/team.model';
import NotificationModel from '../models/notification.model';
import UserModel from '../models/user.model';
import { socketService } from '../config/socket';
import {
  getMondayUTC,
  createFilledArray,
  getSupervisedUserIds,
} from '../utils/data';
import {
  ITimesheet,
  ICreateTimesheetParams,
  ITimesheetCategoryInput,
  UpdateTimesheetParams,
} from '../interfaces';
import { createTimesheetSubmittedNotification, createTimesheetEditRequestNotification, createTimesheetEditApprovedNotification, createTimesheetEditRejectedNotification } from '../utils/notification/notificationUtils';
import TimesheetEditRequestModel from '../models/timesheetEditRequest.model';

export const createTimesheet = async (params: ICreateTimesheetParams) => {
  const dataWithDailyStatus = params.data.map((category) => ({
    ...category,
    items: category.items.map((item) => ({
      ...item,
      dailyStatus: createFilledArray(7, TimesheetStatus.Draft),
    })),
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

export const createTimesheetWithBusinessLogic = async (
  userId: string,
  weekStartDate: string | Date,
  data: ITimesheetCategoryInput[]
) => {
  const dataWithDailyStatus = data.map((category) => ({
    ...category,
    items: category.items.map((item) => ({
      ...item,
      dailyStatus: Array(7).fill(TimesheetStatus.Draft),
    })),
  }));

  return await createTimesheet({
    userId,
    weekStartDate,
    data: dataWithDailyStatus,
  });
};

export const submitDraftTimesheets = async (userId: string, ids: string[]) => {
  const results = [];

  // Get employee information for notifications
  const employee = await UserModel.findById(userId).select('firstName lastName');
  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'An employee';

  // Get all supervisors for this employee
  const employeeProjects = await ProjectModel.find({ employees: userId }).populate('supervisor', '_id firstName lastName');
  const employeeTeams = await TeamModel.find({ members: userId }).populate('supervisor', '_id firstName lastName');

  const supervisorIds = new Set<string>();
  
  // Add supervisors from projects
  employeeProjects.forEach(project => {
    if (project.supervisor?._id) {
      const supervisor = project.supervisor as any;
      const supervisorIdStr = supervisor._id.toString();
      // Don't send notification to the employee themselves
      if (supervisorIdStr !== userId) {
        supervisorIds.add(supervisorIdStr);
        console.log('Added project supervisor:', supervisor.firstName, supervisor.lastName, supervisorIdStr);
      }
    }
  });
  
  // Add supervisors from teams
  employeeTeams.forEach(team => {
    if (team.supervisor?._id) {
      const supervisor = team.supervisor as any;
      const supervisorIdStr = supervisor._id.toString();
      // Don't send notification to the employee themselves
      if (supervisorIdStr !== userId) {
        supervisorIds.add(supervisorIdStr);
        console.log('Added team supervisor:', supervisor.firstName, supervisor.lastName, supervisorIdStr);
      }
    }
  });

  console.log(`Employee ${employeeName} (${userId}) submitting timesheets. Found ${supervisorIds.size} supervisors to notify.`);

  for (const id of ids) {
    try {
      const timesheet = await Timesheet.findOne({
        _id: id,
        userId,
        $or: [
          { status: TimesheetStatus.Draft },
          { status: TimesheetStatus.Rejected },
        ],
      });

      if (!timesheet) {
        console.log('Timesheet not found or not Draft/Rejected:', id);
        continue;
      }

      const originalStatus = timesheet.status;

      timesheet.data.forEach((category) => {
        category.items.forEach((item) => {
          if (originalStatus === TimesheetStatus.Draft) {
            item.dailyStatus = Array(7).fill(TimesheetStatus.Pending);
          } else if (originalStatus === TimesheetStatus.Rejected) {
            if (!item.dailyStatus || item.dailyStatus.length !== 7) {
              item.dailyStatus = Array(7).fill(TimesheetStatus.Pending);
            } else {
              item.dailyStatus = item.dailyStatus.map(
                (status: TimesheetStatus) =>
                  status === TimesheetStatus.Rejected
                    ? TimesheetStatus.Pending
                    : status
              );
            }
          }
        });
      });

      timesheet.markModified('data');
      timesheet.status = TimesheetStatus.Pending;
      const savedTimesheet = await timesheet.save();

      results.push(savedTimesheet);

      // Send notifications to all supervisors
      if (supervisorIds.size > 0) {
        const weekStartDate = new Date(timesheet.weekStartDate);
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);

        // Send notification to each supervisor
        for (const supervisorId of supervisorIds) {
          try {
            await createTimesheetSubmittedNotification(
              supervisorId,
              employeeName,
              weekStartDate,
              weekEndDate,
              userId
            );
          } catch (notifError) {
            console.error('Error sending notification to supervisor:', supervisorId, notifError);
          }
        }
      }
    } catch (error) {
      console.error('Error updating timesheet', id, ':', error);
    }
  }

  return { matched: ids.length, modified: results.length };
};

export const updateDailyTimesheetStatus = async (
  supervisorId: string,
  timesheetId: string,
  categoryIndex: number,
  itemIndex: number,
  dayIndices: number[],
  status: TimesheetStatus.Approved | TimesheetStatus.Rejected,
  rejectionReason?: string
) => {
  appAssert(
    timesheetId && timesheetId.length === 24,
    BAD_REQUEST,
    `Invalid timesheet ID format: ${timesheetId}`
  );

  // Find the timesheet and verify supervisor has access
  const timesheet = await Timesheet.findById(timesheetId).populate(
    'userId',
    'firstName lastName email'
  );
  appAssert(timesheet, NOT_FOUND, 'Timesheet not found');

  const supervisedProjects = await ProjectModel.find({
    supervisor: supervisorId,
  });
  const supervisedTeams = await TeamModel.find({ supervisor: supervisorId });

  const supervisedProjectIds = supervisedProjects.map((p) => p._id.toString());
  const supervisedTeamIds = supervisedTeams.map((t) => t._id.toString());

  const projectSupervisedUserIds = Array.from(
    new Set(
      supervisedProjects.flatMap(
        (p) => p.employees?.map((e) => e.toString()) || []
      )
    )
  );

  const teamSupervisedUserIds = Array.from(
    new Set(
      supervisedTeams.flatMap((t) => t.members?.map((m) => m.toString()) || [])
    )
  );

  const allSupervisedUserIds = Array.from(
    new Set([...projectSupervisedUserIds, ...teamSupervisedUserIds])
  );

  const timesheetUserId = timesheet.userId._id
    ? timesheet.userId._id.toString()
    : timesheet.userId.toString();
  appAssert(
    allSupervisedUserIds.includes(timesheetUserId),
    UNAUTHORIZED,
    'Unauthorized: You can only approve timesheets from your supervised employees'
  );

  const item = timesheet.data[categoryIndex].items[itemIndex];
  const supervisesEmployee = allSupervisedUserIds.includes(timesheetUserId);

  if (item.projectId && item.teamId) {
    const isProjectSupervised = supervisedProjectIds.includes(item.projectId);
    appAssert(
      isProjectSupervised || supervisesEmployee,
      UNAUTHORIZED,
      'Unauthorized: You can only approve project timesheet items if you supervise that specific project or the employee'
    );
  } else if (item.projectId) {
    const isProjectSupervised = supervisedProjectIds.includes(item.projectId);
    appAssert(
      isProjectSupervised || supervisesEmployee,
      UNAUTHORIZED,
      'Unauthorized: You can only approve project timesheets if you supervise that specific project or the employee'
    );
  } else if (item.teamId) {
    const isTeamSupervised = supervisedTeamIds.includes(item.teamId);
    appAssert(
      isTeamSupervised || supervisesEmployee,
      UNAUTHORIZED,
      'Unauthorized: You can only approve team timesheets if you supervise that specific team or the employee'
    );
  }

  appAssert(
    categoryIndex >= 0 && categoryIndex < timesheet.data.length,
    BAD_REQUEST,
    `Invalid category index: ${categoryIndex}. Available categories: ${timesheet.data.length}`
  );
  const category = timesheet.data[categoryIndex];
  appAssert(
    itemIndex >= 0 && itemIndex < category.items.length,
    BAD_REQUEST,
    `Invalid item index: ${itemIndex}. Available items in category '${category.category}': ${category.items.length}`
  );

  const categoryItem = category.items[itemIndex];

  if (!categoryItem.dailyStatus || categoryItem.dailyStatus.length !== 7) {
    categoryItem.dailyStatus = Array(7).fill(TimesheetStatus.Pending);
  }

  dayIndices.forEach((dayIndex) => {
    if (dayIndex >= 0 && dayIndex < 7) {
      categoryItem.dailyStatus[dayIndex] = status;
    }
  });

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
      console.error(
        'Failed to save RejectReason for individual rejection:',
        err
      );
    }
  }

  timesheet.markModified('data');

  const allItemsProcessed = timesheet.data.every((cat) =>
    cat.items.every((itm) =>
      itm.dailyStatus.every(
        (dayStatus) =>
          dayStatus === TimesheetStatus.Approved ||
          dayStatus === TimesheetStatus.Rejected
      )
    )
  );

  if (allItemsProcessed) {
    const allApproved = timesheet.data.every((cat) =>
      cat.items.every((itm) =>
        itm.dailyStatus.every(
          (dayStatus) => dayStatus === TimesheetStatus.Approved
        )
      )
    );
    timesheet.status = allApproved
      ? TimesheetStatus.Approved
      : TimesheetStatus.Rejected;

    if (timesheet.status === TimesheetStatus.Rejected && rejectionReason) {
      timesheet.rejectionReason = rejectionReason;
    }
  }

  const savedTimesheet = await timesheet.save();

  try {
    if (status === TimesheetStatus.Rejected) {
      const weekStart = new Date(savedTimesheet.weekStartDate);
      const item: any = savedTimesheet.data[categoryIndex].items[itemIndex];
      const projectId = item.projectId || '';

      let projectName = 'Project';
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
        type: NotificationType.TimesheetRejected,
        title: `Timesheet Rejected - ${projectName}`,
        message: `Timesheet rejected for ${rejectedDates.join(', ')}${
          rejectionReason ? ` - Reason: ${rejectionReason}` : ''
        }`,
        projectId,
        projectName,
        rejectedDates,
        reason: rejectionReason,
      });

      const targetUserId = (
        (savedTimesheet.userId as any)._id || savedTimesheet.userId
      ).toString();
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
  const groupedUpdates = new Map<string, typeof updates>();
  updates.forEach((update) => {
    if (!groupedUpdates.has(update.timesheetId)) {
      groupedUpdates.set(update.timesheetId, []);
    }
    groupedUpdates.get(update.timesheetId)!.push(update);
  });

  const results = [];

  const supervisedProjects = await ProjectModel.find({
    supervisor: supervisorId,
  });
  const supervisedTeams = await TeamModel.find({ supervisor: supervisorId });

  const supervisedProjectIds = supervisedProjects.map((p) => p._id.toString());
  const supervisedTeamIds = supervisedTeams.map((t) => t._id.toString());

  const projectSupervisedUserIds = Array.from(
    new Set(
      supervisedProjects.flatMap(
        (p) => p.employees?.map((e) => e.toString()) || []
      )
    )
  );

  const teamSupervisedUserIds = Array.from(
    new Set(
      supervisedTeams.flatMap((t) => t.members?.map((m) => m.toString()) || [])
    )
  );

  const allSupervisedUserIds = Array.from(
    new Set([...projectSupervisedUserIds, ...teamSupervisedUserIds])
  );

  for (const [timesheetId, timesheetUpdates] of groupedUpdates) {
    try {
      if (!timesheetId || timesheetId.length !== 24) {
        const error = `Invalid timesheet ID format: ${timesheetId}`;
        console.error(error);
        throw new Error(error);
      }

      const timesheet = await Timesheet.findById(timesheetId).populate(
        'userId',
        'firstName lastName email'
      );

      if (!timesheet) {
        const error = `Timesheet not found: ${timesheetId}`;
        console.error(error);
        throw new Error(error);
      }

      const timesheetUserId = timesheet.userId._id
        ? timesheet.userId._id.toString()
        : timesheet.userId.toString();

      if (!allSupervisedUserIds.includes(timesheetUserId)) {
        const error =
          'Unauthorized: You can only approve timesheets from your supervised employees';
        console.error(error, {
          timesheetUserId,
          allSupervisedUserIds,
        });
        throw new Error(error);
      }

      for (const update of timesheetUpdates) {
        const { categoryIndex, itemIndex } = update;

        if (categoryIndex < 0 || categoryIndex >= timesheet.data.length) {
          console.error('Invalid category index:', {
            categoryIndex,
            availableCategories: timesheet.data.length,
          });
          throw new Error(`Invalid category index: ${categoryIndex}`);
        }

        const category = timesheet.data[categoryIndex];
        if (itemIndex < 0 || itemIndex >= category.items.length) {
          console.error('Invalid item index:', {
            itemIndex,
            availableItems: category.items.length,
          });
          throw new Error(`Invalid item index: ${itemIndex}`);
        }

        const item = category.items[itemIndex];
        
        // Authorization logic: Allow approval if supervisor supervises the employee OR the specific resource
        const supervisesEmployee = allSupervisedUserIds.includes(timesheetUserId);

        if (item.projectId && item.teamId) {
          const isProjectSupervised = supervisedProjectIds.includes(
            item.projectId
          );
          if (!isProjectSupervised && !supervisesEmployee) {
            console.error('Authorization failed:', {
              itemProjectId: item.projectId,
              itemTeamId: item.teamId,
              supervisedProjectIds,
              supervisesEmployee,
              message:
                'You can only approve project timesheet items if you supervise that specific project or the employee',
            });
            throw new Error(
              'Unauthorized: You can only approve project timesheet items if you supervise that specific project or the employee'
            );
          }
        } else if (item.projectId) {
          // Project timesheet - can approve if supervises project OR employee
          const isProjectSupervised = supervisedProjectIds.includes(
            item.projectId
          );
          if (!isProjectSupervised && !supervisesEmployee) {
            console.error('Authorization failed:', {
              itemProjectId: item.projectId,
              supervisedProjectIds,
              supervisesEmployee,
              message:
                'You can only approve project timesheets if you supervise that specific project or the employee',
            });
            throw new Error(
              'Unauthorized: You can only approve project timesheets if you supervise that specific project or the employee'
            );
          }
        } else if (item.teamId) {
          // Team timesheet - can approve if supervises team OR employee
          const isTeamSupervised = supervisedTeamIds.includes(item.teamId);
          if (!isTeamSupervised && !supervisesEmployee) {
            console.error('Authorization failed:', {
              itemTeamId: item.teamId,
              supervisedTeamIds,
              supervisesEmployee,
              message:
                'You can only approve team timesheets if you supervise that specific team or the employee',
            });
            throw new Error(
              'Unauthorized: You can only approve team timesheets if you supervise that specific team or the employee'
            );
          }
        }
      }

      for (const update of timesheetUpdates) {
        const {
          categoryIndex,
          itemIndex,
          dayIndices,
          status,
          rejectionReason,
        } = update;

        if (categoryIndex < 0 || categoryIndex >= timesheet.data.length) {
          const error = `Invalid category index: ${categoryIndex}. Available: 0-${
            timesheet.data.length - 1
          }`;
          console.error(error);
          throw new Error(error);
        }

        const category = timesheet.data[categoryIndex];
        if (itemIndex < 0 || itemIndex >= category.items.length) {
          const error = `Invalid item index: ${itemIndex}. Available: 0-${
            category.items.length - 1
          }`;
          console.error(error);
          throw new Error(error);
        }

        const item = category.items[itemIndex];

        if (!item.dailyStatus || item.dailyStatus.length !== 7) {
          console.log('Initializing dailyStatus array for item');
          item.dailyStatus = Array(7).fill(TimesheetStatus.Pending);
        }

        dayIndices.forEach((dayIndex) => {
          if (dayIndex >= 0 && dayIndex < 7) {
            console.log(
              `Updating day ${dayIndex} from ${item.dailyStatus[dayIndex]} to ${status}`
            );
            item.dailyStatus[dayIndex] = status;
          } else {
            const error = `Invalid day index: ${dayIndex}. Must be 0-6`;
            console.error(error);
            throw new Error(error);
          }
        });

        if (status === TimesheetStatus.Rejected) {
          console.log('Rejection timeshet recieved');
          timesheet.status = TimesheetStatus.Rejected;
        }

        if (status === TimesheetStatus.Rejected && rejectionReason) {
          try {
            const rejectReasonData: any = {
              reason: rejectionReason,
              timesheet_id: timesheet._id.toString(),
              work_name: item.work,
              rejected_days_indexes: dayIndices,
            };

            if (item.projectId) {
              rejectReasonData.project_id = item.projectId;
            }
            if (item.teamId) {
              rejectReasonData.team_id = item.teamId;
            }

            await RejectReason.create(rejectReasonData);
            console.log(
              'RejectReason saved for individual rejection:',
              rejectReasonData
            );
          } catch (err) {
            console.error(
              'Failed to save RejectReason for individual rejection:',
              err
            );
          }
        }

        console.log('Updated dailyStatus:', item.dailyStatus);
      }

      timesheet.markModified('data');

      const allItemsProcessed = timesheet.data.every((cat) =>
        cat.items.every((itm) =>
          itm.dailyStatus.every(
            (dayStatus) =>
              dayStatus === TimesheetStatus.Approved ||
              dayStatus === TimesheetStatus.Rejected
          )
        )
      );

      console.log('All items processed:', allItemsProcessed);

      if (allItemsProcessed) {
        const allApproved = timesheet.data.every((cat) =>
          cat.items.every((itm) =>
            itm.dailyStatus.every(
              (dayStatus) => dayStatus === TimesheetStatus.Approved
            )
          )
        );

        console.log('All approved:', allApproved);

        timesheet.status = allApproved
          ? TimesheetStatus.Approved
          : TimesheetStatus.Rejected;

        if (timesheet.status === TimesheetStatus.Rejected) {
          const rejectionUpdate = timesheetUpdates.find(
            (u) => u.rejectionReason
          );
          if (rejectionUpdate?.rejectionReason) {
            timesheet.rejectionReason = rejectionUpdate.rejectionReason;
          }
        }
      }

      const savedTimesheet = await timesheet.save();
      results.push(savedTimesheet);

      const hadRejection = timesheetUpdates.some(
        (u) => u.status === TimesheetStatus.Rejected
      );
      if (hadRejection) {
        try {
          const weekStart = new Date(timesheet.weekStartDate);
          const rejectedSummaries: Array<{
            projectId?: string;
            projectName?: string;
            rejectedDates: string[];
            reason?: string;
          }> = [];

          for (const u of timesheetUpdates.filter(
            (u) => u.status === TimesheetStatus.Rejected
          )) {
            const item = timesheet.data[u.categoryIndex].items[
              u.itemIndex
            ] as any;
            const projectId = item.projectId;

            let projectName = undefined;
            if (projectId) {
              try {
                const project = await ProjectModel.findById(projectId);
                projectName = project?.projectName;
              } catch (error) {
                console.error(
                  'Error fetching project name for batch update:',
                  error
                );
              }
            }

            const rejectedDates = u.dayIndices.map((d) => {
              const date = new Date(weekStart);
              date.setUTCDate(date.getUTCDate() + d);
              return date.toISOString().split('T')[0];
            });
            rejectedSummaries.push({
              projectId,
              projectName,
              rejectedDates,
              reason: u.rejectionReason,
            });
          }

          const allDates = Array.from(
            new Set(rejectedSummaries.flatMap((s) => s.rejectedDates))
          ).sort();
          const firstProjectName =
            rejectedSummaries.find((s) => !!s.projectName)?.projectName ||
            'Project';
          const reasons = Array.from(
            new Set(rejectedSummaries.map((s) => s.reason).filter(Boolean))
          ) as string[];
          const message = `Timesheet rejected for ${allDates.join(', ')}${
            reasons.length ? ` - Reason: ${reasons.join('; ')}` : ''
          }`;

          const notif = await NotificationModel.create({
            userId: (timesheet.userId as any)._id || timesheet.userId,
            type: NotificationType.TimesheetRejected,
            title: `Timesheet Rejected - ${firstProjectName}`,
            message,
            projectId: rejectedSummaries[0]?.projectId,
            projectName: firstProjectName,
            rejectedDates: allDates,
            reason: reasons[0],
          });

          const targetUserId = (
            (timesheet.userId as any)._id || timesheet.userId
          ).toString();
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

export const hasSubmittedTimesheetForWeek = async (
  userId: string,
  weekStartDate: Date,
  weekEndDate: Date
): Promise<boolean> => {
  try {
    const startDate = new Date(weekStartDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(weekEndDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const timesheet = await Timesheet.findOne({
      userId,
      weekStartDate: {
        $gte: startDate,
        $lte: endDate,
      },
      status: {
        $in: [TimesheetStatus.Pending, TimesheetStatus.Approved],
      },
    });

    return !!timesheet;
  } catch (error) {
    console.error('Error checking timesheet submission:', error);
    return false;
  }
};

export const listUserTimesheets = async (userId: string) => {
  return await Timesheet.find({ userId }).sort({ weekStartDate: -1 });
};

export const getSupervisedTimesheets = async (supervisorId: string) => {
  const allSupervisedUserIds = await getSupervisedUserIds(supervisorId);

  if (allSupervisedUserIds.length === 0) {
    return [];
  }

  const timesheets = await Timesheet.find({
    userId: { $in: allSupervisedUserIds },
  })
    .populate('userId', 'firstName lastName email contactNumber designation employee_id')
    .sort({ weekStartDate: -1 });

  // Fetch edit requests for EditRequested timesheets
  const editRequestedTimesheetIds = timesheets
    .filter(ts => ts.status === TimesheetStatus.EditRequested)
    .map(ts => ts._id);
  
  const editRequests = editRequestedTimesheetIds.length > 0
    ? await TimesheetEditRequestModel.find({
        timesheetId: { $in: editRequestedTimesheetIds },
        status: 'Pending'
      })
    : [];
  
  const editRequestMap = new Map(
    editRequests.map(req => [req.timesheetId.toString(), req])
  );

  const projectIds = new Set<string>();
  const teamIds = new Set<string>();

  timesheets.forEach((ts) => {
    ts.data?.forEach((category) => {
      category.items?.forEach((item) => {
        if (item.projectId) {
          projectIds.add(item.projectId);
        }
        if (item.teamId) {
          teamIds.add(item.teamId);
        }
      });
    });
  });

  const projects = await ProjectModel.find({
    _id: { $in: Array.from(projectIds) },
  });
  const teams = await TeamModel.find({ _id: { $in: Array.from(teamIds) } });

  const projectMap = new Map(
    projects.map((p) => [p._id.toString(), p.projectName])
  );
  const teamMap = new Map(teams.map((t) => [t._id.toString(), t.teamName]));

  const enrichedTimesheets = timesheets.map((ts) => {
    ts.data?.forEach((category) => {
      category.items?.forEach((item) => {
        if (item.projectId && projectMap.has(item.projectId)) {
          (item as any).projectName = projectMap.get(item.projectId);
        }
        if (item.teamId && teamMap.has(item.teamId)) {
          (item as any).teamName = teamMap.get(item.teamId);
        }
      });
    });

    // Attach edit request info if this timesheet has an active edit request
    const editRequest = editRequestMap.get(ts._id.toString());
    if (editRequest) {
      return {
        ...ts.toObject(),
        editRequest: {
          _id: editRequest._id,
          requiredApprovals: editRequest.requiredApprovals,
          approvedBy: editRequest.approvedBy,
          status: editRequest.status
        }
      };
    }
    
    return ts;
  });

  return enrichedTimesheets;
};

export const updateSupervisedTimesheetsStatus = async (
  supervisorId: string,
  ids: string[],
  status: TimesheetStatus
) => {
  const allSupervisedUserIds = await getSupervisedUserIds(supervisorId);

  if (allSupervisedUserIds.length === 0) {
    throw new Error('You have no supervised employees');
  }

  return await Timesheet.updateMany(
    {
      _id: { $in: ids },
      userId: { $in: allSupervisedUserIds },
      status: TimesheetStatus.Pending,
    },
    { $set: { status } }
  );
};

export const updateUserTimesheet = async (
  userId: string,
  timesheetId: string,
  updateData: UpdateTimesheetParams
) => {
  const { weekStartDate, data, status } = updateData;
  const updateFields: Partial<ITimesheet> = {};

  if (weekStartDate) {
    updateFields.weekStartDate =
      weekStartDate instanceof Date ? weekStartDate : new Date(weekStartDate);
  }

  if (data) {
    const existingTimesheet = await Timesheet.findOne({
      _id: timesheetId,
      userId,
    });

    const dataWithDailyStatus = data.map(
      (category: any, categoryIndex: number) => ({
        ...category,
        items: category.items.map((item: any, itemIndex: number) => {
          const existingDailyStatus =
            existingTimesheet?.data?.[categoryIndex]?.items?.[itemIndex]
              ?.dailyStatus;

          return {
            ...item,
            dailyStatus:
              existingDailyStatus && existingDailyStatus.length === 7
                ? existingDailyStatus
                : (item as any).dailyStatus &&
                  (item as any).dailyStatus.length === 7
                ? (item as any).dailyStatus
                : Array(7).fill(TimesheetStatus.Draft),
          };
        }),
      })
    );
    (updateFields as any).data = dataWithDailyStatus;
  }

  if (status) updateFields.status = status;

  return await Timesheet.findOneAndUpdate(
    { _id: timesheetId, userId },
    { $set: updateFields },
    { new: true }
  );
};

export const deleteUserTimesheet = async (
  userId: string,
  timesheetId: string
) => {
  return await Timesheet.findOneAndDelete({ _id: timesheetId, userId });
};

export const getOrCreateTimesheetForWeek = async (
  userId: string,
  weekStartDateRaw?: string
) => {
  let weekStartDate = getMondayUTC(
    weekStartDateRaw ? weekStartDateRaw : new Date()
  );

  return await Timesheet.findOneAndUpdate(
    { userId, weekStartDate },
    {
      $setOnInsert: {
        userId,
        weekStartDate,
        status: TimesheetStatus.Draft,
        data: [],
      },
    },
    { new: true, upsert: true }
  );
};

// Request to edit a timesheet
export const requestTimesheetEdit = async (userId: string, timesheetId: string) => {
  // Find the timesheet
  const timesheet = await Timesheet.findOne({ _id: timesheetId, userId });
  appAssert(timesheet, NOT_FOUND, 'Timesheet not found');
  
  // Only allow edit requests for Pending or Approved timesheets
  appAssert(
    timesheet.status === TimesheetStatus.Pending || timesheet.status === TimesheetStatus.Approved,
    BAD_REQUEST,
    'Can only request edit for Pending or Approved timesheets'
  );

  // Get employee information
  const employee = await UserModel.findById(userId).select('firstName lastName');
  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'An employee';

  // Get all supervisors
  const employeeProjects = await ProjectModel.find({ employees: userId }).populate('supervisor', '_id');
  const employeeTeams = await TeamModel.find({ members: userId }).populate('supervisor', '_id');

  const supervisorIds = new Set<string>();
  employeeProjects.forEach(project => {
    if (project.supervisor?._id) {
      const supervisorIdStr = (project.supervisor as any)._id.toString();
      if (supervisorIdStr !== userId) {
        supervisorIds.add(supervisorIdStr);
      }
    }
  });
  employeeTeams.forEach(team => {
    if (team.supervisor?._id) {
      const supervisorIdStr = (team.supervisor as any)._id.toString();
      if (supervisorIdStr !== userId) {
        supervisorIds.add(supervisorIdStr);
      }
    }
  });

  const supervisorIdsArray = Array.from(supervisorIds);
  appAssert(supervisorIdsArray.length > 0, BAD_REQUEST, 'No supervisors found');

  // Check if there's already a pending edit request
  const existingRequest = await TimesheetEditRequestModel.findOne({
    timesheetId,
    status: 'Pending',
  });

  if (existingRequest) {
    return { message: 'Edit request already exists', editRequest: existingRequest };
  }

  // Create edit request
  const editRequest = await TimesheetEditRequestModel.create({
    timesheetId,
    employeeId: userId,
    weekStartDate: timesheet.weekStartDate,
    requiredApprovals: supervisorIdsArray,
    approvedBy: [],
    status: 'Pending',
  });

  // Update timesheet status
  timesheet.status = TimesheetStatus.EditRequested;
  await timesheet.save();

  // Send notifications to all supervisors
  const weekStartDate = new Date(timesheet.weekStartDate);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);

  for (const supervisorId of supervisorIdsArray) {
    try {
      await createTimesheetEditRequestNotification(
        supervisorId,
        employeeName,
        weekStartDate,
        weekEndDate,
        timesheetId,
        userId // Pass employeeId for navigation
      );
    } catch (error) {
      console.error('Error sending edit request notification to supervisor:', supervisorId, error);
    }
  }

  return { message: 'Edit request sent successfully', editRequest };
};

// Approve edit request
export const approveTimesheetEditRequest = async (supervisorId: string, timesheetId: string) => {
  // Find the edit request
  const editRequest = await TimesheetEditRequestModel.findOne({
    timesheetId,
    status: 'Pending',
  });
  
  appAssert(editRequest, NOT_FOUND, 'Edit request not found');

  // Check if supervisor is in required approvals
  const supervisorIdStr = supervisorId.toString();
  const isRequired = editRequest.requiredApprovals.some(
    (id) => id.toString() === supervisorIdStr
  );
  appAssert(isRequired, UNAUTHORIZED, 'You are not authorized to approve this request');

  // Check if already approved
  const alreadyApproved = editRequest.approvedBy.some(
    (id) => id.toString() === supervisorIdStr
  );
  if (alreadyApproved) {
    return { message: 'Already approved', editRequest };
  }

  // Add to approved list
  editRequest.approvedBy.push(supervisorId as any);

  // Check if all approvals received
  if (editRequest.approvedBy.length >= editRequest.requiredApprovals.length) {
    editRequest.status = 'Approved';
    
    // Change timesheet status back to Draft
    const timesheet = await Timesheet.findById(timesheetId).populate('userId');
    if (timesheet) {
      timesheet.status = TimesheetStatus.Draft;
      
      // Change all daily statuses to Draft
      timesheet.data.forEach((category) => {
        category.items.forEach((item) => {
          item.dailyStatus = Array(7).fill(TimesheetStatus.Draft);
        });
      });
      
      timesheet.markModified('data');
      await timesheet.save();

      // Send notification to employee
      const weekStartDate = new Date(timesheet.weekStartDate);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      
      await createTimesheetEditApprovedNotification(
        editRequest.employeeId.toString(),
        weekStartDate,
        weekEndDate
      );
    }
  }

  await editRequest.save();

  return { 
    message: editRequest.status === 'Approved' ? 'Edit request fully approved. Timesheet is now editable.' : 'Approval recorded',
    editRequest,
    allApproved: editRequest.status === 'Approved'
  };
};

// Reject timesheet edit request
export const rejectTimesheetEditRequest = async (supervisorId: string, timesheetId: string) => {
  // Find the edit request
  const editRequest = await TimesheetEditRequestModel.findOne({
    timesheetId,
    status: 'Pending',
  });
  
  appAssert(editRequest, NOT_FOUND, 'Edit request not found');

  // Check if supervisor is in required approvals
  const supervisorIdStr = supervisorId.toString();
  const isRequired = editRequest.requiredApprovals.some(
    (id) => id.toString() === supervisorIdStr
  );
  appAssert(isRequired, UNAUTHORIZED, 'You are not authorized to reject this request');

  // Mark as rejected
  editRequest.status = 'Rejected';
  await editRequest.save();

  // Change timesheet status back to previous status (Pending or Approved)
  const timesheet = await Timesheet.findById(timesheetId);
  if (timesheet) {
    // Keep it as EditRequested but we can change it to the previous status
    // For simplicity, we'll just mark the edit request as rejected
    // The timesheet will remain in EditRequested status until employee submits again
    timesheet.status = TimesheetStatus.Pending; // or we can keep a previous status field
    await timesheet.save();

    // Send notification to employee
    const weekStartDate = new Date(timesheet.weekStartDate);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    
    await createTimesheetEditRejectedNotification(
      editRequest.employeeId.toString(),
      weekStartDate,
      weekEndDate
    );
  }

  return { 
    message: 'Edit request rejected',
    editRequest
  };
};

// Get pending edit requests for a supervisor
export const getPendingEditRequestsForSupervisor = async (supervisorId: string) => {
  const editRequests = await TimesheetEditRequestModel.find({
    requiredApprovals: supervisorId,
    status: 'Pending',
  })
    .populate('employeeId', 'firstName lastName email')
    .populate('timesheetId')
    .sort({ createdAt: -1 });

  return editRequests;
};
