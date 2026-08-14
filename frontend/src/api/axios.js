import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('abt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // token expired / invalid → drop it so the app falls back to guest mode
    if (err.response?.status === 401 && localStorage.getItem('abt_token')) {
      localStorage.removeItem('abt_token');
    }
    return Promise.reject(err);
  }
);

export default api;
