import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth.api';
import * as userApi from '../api/user.api';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

const GUEST_FAV_KEY = 'abt_favs';

function loadGuestFavs() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_FAV_KEY) || '[]');
  } catch {
    return [];
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('abt_token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('abt_token'));
  const [favoriteIds, setFavoriteIds] = useState(() => {
    if (localStorage.getItem('abt_token')) return [];
    return loadGuestFavs();
  });

  // restore session on mount
  useEffect(() => {
    if (!token) return;
    authApi
      .getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        setToken(null);
        localStorage.removeItem('abt_token');
        setFavoriteIds(loadGuestFavs());
      })
      .finally(() => setLoading(false));
  }, [token]);

  const applySession = (data) => {
    localStorage.setItem('abt_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setFavoriteIds((data.user.favorites || []).map(String));
  };

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login({ email, password });
      applySession(res.data);
      return res.data.user;
    },
    []
  );

  const register = useCallback(
    async (name, email, password) => {
      const res = await authApi.register({ name, email, password });
      applySession(res.data);
      return res.data.user;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('abt_token');
    setToken(null);
    setUser(null);
    setFavoriteIds(loadGuestFavs());
  }, []);

  const updateProfile = useCallback(
    async (data) => {
      const res = await authApi.updateMe(data);
      setUser(res.data);
      return res.data;
    },
    []
  );

  // ---- favorites ----
  const isFavorite = useCallback((id) => favoriteIds.includes(String(id)), [favoriteIds]);

  const toggleFavorite = useCallback(
    async (artworkId) => {
      const id = String(artworkId);
      if (token && user) {
        const res = await userApi.toggleFavorite(id);
        setFavoriteIds(res.data.favoriteIds.map(String));
        return res.data.favoriteIds.includes(id);
      }
      const next = favoriteIds.includes(id)
        ? favoriteIds.filter((f) => f !== id)
        : [...favoriteIds, id];
      setFavoriteIds(next);
      localStorage.setItem(GUEST_FAV_KEY, JSON.stringify(next));
      return next.includes(id);
    },
    [token, user, favoriteIds]
  );

  // ---- addresses ----
  const saveAddress = useCallback(
    async (data, id) => {
      const res = id ? await userApi.updateAddress(id, data) : await userApi.addAddress(data);
      setUser((u) => (u ? { ...u, addresses: res.data } : u));
      return res.data;
    },
    []
  );

  const removeAddress = useCallback(
    async (id) => {
      const res = await userApi.deleteAddress(id);
      setUser((u) => (u ? { ...u, addresses: res.data } : u));
      return res.data;
    },
    []
  );

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    favoriteIds,
    isFavorite,
    toggleFavorite,
    saveAddress,
    removeAddress,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
