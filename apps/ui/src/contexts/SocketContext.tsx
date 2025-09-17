import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getApiBaseURL } from '../config/apiClient';
import { useToast } from './ToastContext';


type AppNotification = {
  id: string;
  title?: string;
  message: string;
  createdAt: number;
  read: boolean;
  projectName?: string;
  projectId?: string;
  rejectedDates?: string[];
  reason?: string;
};


type SocketContextValue = {
  socket: Socket | null;
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  clearNotifications: () => void;
  setNotificationsFromServer: (items: AppNotification[]) => void;
  addNotificationSilent: (item: AppNotification) => void;
};


const SocketContext = createContext<SocketContextValue>({ socket: null, notifications: [], unreadCount: 0, markAllRead: () => {}, clearNotifications: () => {}, setNotificationsFromServer: () => {}, addNotificationSilent: () => {} });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { info } = useToast();
  const socketRef = useRef<Socket | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback((payload: any) => {
    const { title, message, projectName, projectId, rejectedDates, reason, createdAt } = payload || {};
    const n: AppNotification = {
      id: Math.random().toString(36).slice(2),
      title: title || 'Notification',
      message: message || 'New notification',
      createdAt: createdAt ? new Date(createdAt).getTime() : Date.now(),
      read: false,
      projectName,
      projectId,
      rejectedDates,
      reason,
    };
    setNotifications((prev) => [n, ...prev].slice(0, 100));
    info(n.message, n.title);
  }, [info]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const setNotificationsFromServer = useCallback((items: AppNotification[]) => {
    setNotifications(items);
  }, []);

  const addNotificationSilent = useCallback((item: AppNotification) => {
    setNotifications((prev) => [item, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('_id') || '';
    const baseURL = getApiBaseURL();
    // Use same HTTP(S) URL; socket.io handles upgrade
    const socket = io(baseURL, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      path: '/socket.io',
      query: { userId },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      // console.log('Socket connected');
    });

    socket.on('notification', (payload: any) => {
      addNotification(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const unreadCount = notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, unreadCount, markAllRead, clearNotifications, setNotificationsFromServer, addNotificationSilent }}>
      {children}
    </SocketContext.Provider>
  );
};



