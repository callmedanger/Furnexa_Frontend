import axiosInstance from './axiosInstance';

export const fetchNotifications = async () => {
  const res = await axiosInstance.get('/notifications');
  return res.data.data;
};