import axiosInstance from './axiosInstance';

export const fetchOrders = async () => {
  const res = await axiosInstance.get('/orders');
  return res.data.data;
};