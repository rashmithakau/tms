import { Request, Response } from 'express';
import History from '../models/history.model';
import { HistoryActionType } from '../constants/historyActionType';
import { UserRole } from '@tms/shared';

export const getHistoryHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole as UserRole;

    if (
      userRole !== UserRole.Admin && 
      userRole !== UserRole.SupervisorAdmin && 
      userRole !== UserRole.SuperAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can view system history.',
      });
    }

    const {
      actionType,
      entityType,
      performedBy,
      startDate,
      endDate,
    } = req.query;

    const query: any = {};

    if (actionType) {
      const types = Array.isArray(actionType) ? actionType : [actionType];
      query.actionType = { $in: types };
    }

    if (entityType) {
      const types = Array.isArray(entityType) ? entityType : [entityType];
      query['targetEntity.type'] = { $in: types };
    }

    if (performedBy) {
      query.performedBy = performedBy;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate as string);
      }
    }

    const history = await History.find(query)
      .populate('performedBy', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: history,
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
