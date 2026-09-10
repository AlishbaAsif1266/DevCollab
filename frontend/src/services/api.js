import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT Access Token
API.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem('devcollab_access_token') ||
      localStorage.getItem('devcollab_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor for Silent Access Token Refreshing
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and request hasn't been retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh-token')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('devcollab_refresh_token');

      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post('/api/auth/refresh-token', { refreshToken });

        if (res.data.success && res.data.accessToken) {
          const newAccessToken = res.data.accessToken;
          const newRefreshToken = res.data.refreshToken;

          useAuthStore.getState().setAccessToken(newAccessToken);

          if (newRefreshToken) {
            localStorage.setItem('devcollab_refresh_token', newRefreshToken);
          }

          API.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return API(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
