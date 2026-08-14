import api from './axios';

export const createOrder = (data) => api.post('/orders', data);
export const getOrders = (params) => api.get('/orders', { params });
export const getMyOrders = () => api.get('/orders/mine');
export const requestReturn = (orderId, reason) => api.post(`/orders/${orderId}/return`, { reason });
