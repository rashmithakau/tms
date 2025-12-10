import apiClient from '../config/apiClient';

export const listMyNotifications = () => apiClient.get('/notifications');
export const markAllNotificationsRead = () =>
  apiClient.post('/notifications/mark-all-read');
