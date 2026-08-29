import axiosInstance from './axiosInstance';

export const fetchProducts = async () => {
  const res = await axiosInstance.get('/products');
  return res.data.data;
};

export const deleteProduct = async (id) => {
  const res = await axiosInstance.delete(`/products/${id}`);
  return res.data;
};