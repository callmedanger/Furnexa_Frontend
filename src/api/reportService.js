import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const generateAIReport = async ({ users, orders, products, feedbacks }) => {
  const response = await axios.post(`${API_URL}/api/reports/generate-report`, {
    users,
    orders,
    products,
    feedbacks,
  });
  return response.data;
};

export const chatWithAI = async ({ messages, users, orders, products, feedbacks }) => {
  const response = await axios.post(`${API_URL}/api/reports/chat`, {
    messages,
    users,
    orders,
    products,
    feedbacks,
  });
  return response.data;
};