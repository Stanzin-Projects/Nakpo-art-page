import api from './axios';

export const validateCoupon = (code, subtotal) => api.post('/coupons/validate', { code, subtotal });
