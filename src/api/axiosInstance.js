import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // apna backend PORT confirm kar lein
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;