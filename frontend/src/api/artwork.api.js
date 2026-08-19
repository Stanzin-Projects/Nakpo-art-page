import api from './axios';

export const getArtworks = (params) => api.get('/artworks', { params });
export const getArtworkById = (id) => api.get(`/artworks/${id}`);
export const getFeaturedArtworks = () => api.get('/artworks', { params: { featured: 'true' } });

// Admin-only artwork management (backend rejects non-admin tokens).
// Pass a FormData payload (with an `image` file) to upload, or JSON to just set fields/URL.
export const createArtwork = (data) => api.post('/artworks', data);
export const updateArtwork = (id, data) => api.put(`/artworks/${id}`, data);
export const deleteArtwork = (id) => api.delete(`/artworks/${id}`);
