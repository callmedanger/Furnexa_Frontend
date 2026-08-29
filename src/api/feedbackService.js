import axiosInstance from './axiosInstance';

export const fetchFeedbacks = async () => {
  const res = await axiosInstance.get('/feedback');
  return res.data.data;
};