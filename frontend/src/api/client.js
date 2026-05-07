import axios from 'axios';

const localApiUrl =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || localApiUrl,
  withCredentials: true,
});

export const getApiError = (error) =>
  error?.response?.data?.message || error?.message || 'The request could not be completed.';

export default api;
