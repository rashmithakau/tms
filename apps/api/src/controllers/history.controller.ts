import { Request, Response } from 'express';
import History from '../models/history.model';
import { HistoryActionType } from '../constants/historyActionType';
import { UserRole } from '@tms/shared';

export const getHistoryHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole as UserRole;

    const {
      actionType,
      entityType,
      performedBy,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query: any = {};

    // Filter by action type
    if (actionType) {
      const types = Array.isArray(actionType) ? actionType : [actionType];
      query.actionType = { $in: types };
    }

    // Filter by entity type
    if (entityType) {
      const types = Array.isArray(entityType) ? entityType : [entityType];
      query['targetEntity.type'] = { $in: types };
    }

    // Filter by performer
    if (performedBy) {
      query.performedBy = performedBy;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate as string);
      }
    }

    // For Admin users, only show their own actions
    if (userRole === UserRole.Admin || userRole === UserRole.SupervisorAdmin) {
      query.performedBy = userId;
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [history, total] = await Promise.all([
      History.find(query)
        .populate('performedBy', 'firstName lastName email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      History.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Helper function to log history
export const logHistory = async (data: {
  actionType: HistoryActionType;
  performedBy: string;
  targetEntity: {
    type: 'User' | 'Project' | 'Team';
    id: string;
    name: string;
  };
  affectedEntity?: {
    type: 'User' | 'Project' | 'Team';
    id: string;
    name: string;
  };
  description: string;
  metadata?: any;
}) => {
  try {
    await History.create({
      ...data,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging history:', error);
  }
};
