import axiosInstance from './axiosInstance';

export const fetchUsers = async () => {
  const res = await axiosInstance.get('/users');
  return res.data.data;
};

export const deleteUser = async (id) => {
  const res = await axiosInstance.delete(`/users/${id}`);
  return res.data;
};