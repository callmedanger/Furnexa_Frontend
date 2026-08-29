import axiosInstance from './axiosInstance';

export const sendBulkEmail = async ({ recipients, subject, message }) => {
  const res = await axiosInstance.post('/email/send-bulk', { recipients, subject, message });
  return res.data;
};

export const fetchEmailLogs = async () => {
  const res = await axiosInstance.get('/email/logs');
  return res.data.data;
};