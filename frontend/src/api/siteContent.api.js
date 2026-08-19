import api from './axios';

export const getSiteContent = () => api.get('/site-content');
export const updateSiteContent = (data) => api.put('/site-content', data);
