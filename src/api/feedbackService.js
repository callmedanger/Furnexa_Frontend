import axiosInstance from './axiosInstance';

export const fetchFeedbacks = async () => {
  const res = await axiosInstance.get('/feedback');
  return res.data.data;
};

export const replyToFeedback = async (id, message) => {
  const res = await axiosInstance.post(`/feedback/${id}/reply`, { message });
  return res.data;
};

export const analyzeFeedback = async (id) => {
  const res = await axiosInstance.post(`/feedback/${id}/analyze`);
  return res.data;
};