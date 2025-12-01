import { Request, Response } from 'express';
import User from '../models/user.model';
import Project from '../models/project.model';
import Team from '../models/team.model';
import { Timesheet } from '../models/timesheet.model';
import RejectReason from '../models/rejectReason.model';
import { UserRole, TimesheetStatus } from '@tms/shared';

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: true });
    const totalAdmins = await User.countDocuments({
      role: { $in: [UserRole.Admin, UserRole.SupervisorAdmin] }
    });

    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: true });

    const totalTeams = await Team.countDocuments();

    // const currentDate = new Date();
    // const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    // const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // const allTimesheets = await Timesheet.find({}, 'status createdAt').limit(10);
    // const totalTimesheets = await Timesheet.countDocuments();

    const draftTimesheets = await Timesheet.countDocuments({
      status: TimesheetStatus.Draft
    });

    const pendingTimesheets = await Timesheet.countDocuments({
      status: TimesheetStatus.Pending
    });

    const approvedTimesheets = await Timesheet.countDocuments({
      status: TimesheetStatus.Approved
    });

    const rejectedTimesheets = await Timesheet.countDocuments({
      status: TimesheetStatus.Rejected
    });

    const submittedTimesheets = pendingTimesheets + approvedTimesheets + rejectedTimesheets;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const lateTimesheets = await Timesheet.countDocuments({
      status: TimesheetStatus.Pending,
      createdAt: { $lt: weekAgo }
    });

    const dashboardStats = {
      userStats: {
        totalUsers,
        activeUsers,
        totalAdmins
      },
      projectStats: {
        totalProjects,
        activeProjects
      },
      teamStats: {
        totalTeams
      },
      timesheetStats: {
        draftCount: draftTimesheets,
        submittedCount: submittedTimesheets,
        pendingCount: pendingTimesheets,
        approvedCount: approvedTimesheets,
        rejectedCount: rejectedTimesheets,
        lateCount: lateTimesheets
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getTimesheetRejectionReasons = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const rejectedReasons = await RejectReason.find({})
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('reason');

    const reasons = rejectedReasons
      .map(rejectReason => rejectReason.reason)
      .filter(reason => reason && reason.trim() !== '')
      .map(reason => reason || 'No Reason Provided');

    res.status(200).json({
      success: true,
      data: reasons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timesheet rejection reasons',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
