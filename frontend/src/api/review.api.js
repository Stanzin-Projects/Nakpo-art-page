import api from './axios';

export const getReviews = (artworkId) => api.get(`/artworks/${artworkId}/reviews`);
export const createReview = (artworkId, data) => api.post(`/artworks/${artworkId}/reviews`, data);
