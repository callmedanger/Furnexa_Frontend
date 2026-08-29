import axiosInstance from './axiosInstance';

export const fetchRiders = async () => {
  const res = await axiosInstance.get('/riders');
  return res.data.data;
};

export const createRider = async (data) => {
  const res = await axiosInstance.post('/riders', data);
  return res.data;
};

export const toggleRiderAvailability = async (id, isAvailable) => {
  const res = await axiosInstance.patch(`/riders/${id}/availability`, { isAvailable });
  return res.data;
};

export const deleteRider = async (id) => {
  const res = await axiosInstance.delete(`/riders/${id}`);
  return res.data;
};