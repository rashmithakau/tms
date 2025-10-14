import { Socket } from 'socket.io-client';

import { NotificationType } from '@tms/shared';

export interface AppNotification {
  id: string;
  type?: NotificationType;
  title?: string;
  message: string;
  createdAt: number;
  read: boolean;
  projectName?: string;
  projectId?: string;
  rejectedDates?: string[];
  reason?: string;
  relatedUserId?: string;
  weekStartDate?: string;
}

export interface SocketContextValue {
  socket: Socket | null;
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  clearNotifications: () => void;
  setNotificationsFromServer: (items: AppNotification[]) => void;
  addNotificationSilent: (item: AppNotification) => void;
}
