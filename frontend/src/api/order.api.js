import api from './axios';

export const createOrder = (data) => api.post('/orders', data);
export const getOrders = (params) => api.get('/orders', { params });
