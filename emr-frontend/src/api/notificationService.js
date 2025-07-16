import api from './axios';

export const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data.notifications;
};

export const markNotificationAsRead = async (notificationId) => {
  await api.patch(`/notifications/${notificationId}/read`);
};

export const createNotification = async (notificationData) => {
  const response = await api.post('/notifications', notificationData);
  return response.data.notification;
};