import api from './axios';

export const getAddresses = () => api.get('/users/addresses');
export const addAddress = (data) => api.post('/users/addresses', data);
export const updateAddress = (id, data) => api.put(`/users/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/users/addresses/${id}`);
export const getFavorites = () => api.get('/users/favorites');
export const toggleFavorite = (artworkId) => api.put(`/users/favorites/${artworkId}`);
