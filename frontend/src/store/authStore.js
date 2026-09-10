import { create } from 'zustand';

const savedUser = JSON.parse(localStorage.getItem('devcollab_user') || 'null');
const savedAccessToken = localStorage.getItem('devcollab_access_token') || localStorage.getItem('devcollab_token') || null;
const savedRefreshToken = localStorage.getItem('devcollab_refresh_token') || null;

export const useAuthStore = create((set) => ({
  user: savedUser,
  accessToken: savedAccessToken,
  refreshToken: savedRefreshToken,
  isAuthenticated: !!savedAccessToken,
  isLoading: false,
  error: null,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('devcollab_user', JSON.stringify(user));
    localStorage.setItem('devcollab_access_token', accessToken);
    localStorage.setItem('devcollab_token', accessToken); // Backward compatibility
    if (refreshToken) {
      localStorage.setItem('devcollab_refresh_token', refreshToken);
    }
    set({
      user,
      accessToken,
      refreshToken: refreshToken || savedRefreshToken,
      isAuthenticated: true,
      error: null,
    });
  },

  setAccessToken: (newAccessToken) => {
    localStorage.setItem('devcollab_access_token', newAccessToken);
    localStorage.setItem('devcollab_token', newAccessToken);
    set({ accessToken: newAccessToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('devcollab_user');
    localStorage.removeItem('devcollab_access_token');
    localStorage.removeItem('devcollab_refresh_token');
    localStorage.removeItem('devcollab_token');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: null });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  updateUser: (user) => {
    localStorage.setItem('devcollab_user', JSON.stringify(user));
    set({ user });
  },
}));
