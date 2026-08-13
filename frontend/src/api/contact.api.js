import api from './axios';

export const submitContact = (data) => api.post('/contact', data);
