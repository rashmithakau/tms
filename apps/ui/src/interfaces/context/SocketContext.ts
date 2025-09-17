import { Socket } from 'socket.io-client';

export interface AppNotification {
  id: string;
  title?: string;
  message: string;
  createdAt: number;
  read: boolean;
  projectName?: string;
  projectId?: string;
  rejectedDates?: string[];
  reason?: string;
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
