import { Request, Response } from 'express';
import NotificationModel from '../models/notification.model';
import { OK } from '../constants/http';
import { catchErrors } from '../utils/error';

export const listMyNotificationsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(100);
  return res.status(OK).json({ notifications });
});

export const markAllMyNotificationsReadHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const result = await NotificationModel.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
  return res.status(OK).json({ modifiedCount: result.modifiedCount });
});


