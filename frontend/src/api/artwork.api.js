import api from './axios';

export const getArtworks = (params) => api.get('/artworks', { params });
export const getArtworkById = (id) => api.get(`/artworks/${id}`);
export const getFeaturedArtworks = () => api.get('/artworks', { params: { featured: 'true' } });
