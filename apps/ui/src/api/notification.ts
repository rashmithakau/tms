import apiClient from '../config/apiClient';

export const listMyNotifications = () => apiClient.get('/api/notifications');
export const markAllNotificationsRead = () =>
  apiClient.post('/api/notifications/mark-all-read');
