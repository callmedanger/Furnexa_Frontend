import axiosInstance from './axiosInstance';

export const fetchDesigners = async () => {
  const res = await axiosInstance.get('/designers');
  return res.data.data;
};

export const createDesigner = async (data) => {
  const res = await axiosInstance.post('/designers', data);
  return res.data;
};

export const toggleDesignerAvailability = async (id, isAvailable) => {
  const res = await axiosInstance.patch(`/designers/${id}/availability`, { isAvailable });
  return res.data;
};

export const deleteDesigner = async (id) => {
  const res = await axiosInstance.delete(`/designers/${id}`);
  return res.data;
};