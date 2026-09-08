import { create } from 'zustand';

const savedUser = JSON.parse(localStorage.getItem('devcollab_user') || 'null');
const savedToken = localStorage.getItem('devcollab_token') || null;

export const useAuthStore = create((set) => ({
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!savedToken,
  isLoading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem('devcollab_user', JSON.stringify(user));
    localStorage.setItem('devcollab_token', token);
    set({ user, token, isAuthenticated: true, error: null });
  },

  logout: () => {
    localStorage.removeItem('devcollab_user');
    localStorage.removeItem('devcollab_token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  updateUser: (user) => {
    localStorage.setItem('devcollab_user', JSON.stringify(user));
    set({ user });
  },
}));
