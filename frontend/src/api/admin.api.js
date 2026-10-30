import api from './axios';

// Admin-only endpoints (the API rejects anything that is not the admin account).
export const getAdminOrders = (params) => api.get('/admin/orders', { params });
export const getSalesStats = () => api.get('/admin/orders/stats');
export const updateAdminOrder = (id, data) => api.patch(`/admin/orders/${id}`, data);
export const getAdminCustomers = () => api.get('/admin/customers');

// Store-wide sales
export const applyStoreSale = (data) => api.post('/admin/sale/apply', data);
export const clearStoreSale = () => api.post('/admin/sale/clear');

// Buyer accounts
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const updateAdminUser = (id, data) => api.patch(`/admin/users/${id}`, data);
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);
