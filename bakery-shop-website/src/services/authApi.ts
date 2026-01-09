import axios from 'axios';
import type { User, AuthResponse, Order } from '../types';

const API_URL = 'http://localhost:3001/api';

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Add auth header to requests
authApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 403
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        setTokens(data.accessToken, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return authApi(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const register = async (email: string, password: string, name: string, phone?: string): Promise<AuthResponse> => {
  const { data } = await authApi.post('/auth/register', { email, password, name, phone });
  setTokens(data.accessToken, data.refreshToken);
  return data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await authApi.post('/auth/login', { email, password });
  setTokens(data.accessToken, data.refreshToken);
  return data;
};

export const logout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  try {
    await authApi.post('/auth/logout', { refreshToken });
  } finally {
    clearTokens();
  }
};

export const getCurrentUser = async (): Promise<User> => {
  const { data } = await authApi.get('/auth/me');
  return data;
};

export const updateProfile = async (profile: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }): Promise<User> => {
  const { data } = await authApi.put('/auth/profile', profile);
  return data;
};

export const oauthLogin = async (provider: 'google' | 'facebook', providerId: string, email: string, name: string, avatar?: string): Promise<AuthResponse> => {
  const { data } = await authApi.post('/auth/oauth', { provider, providerId, email, name, avatar });
  setTokens(data.accessToken, data.refreshToken);
  return data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const { data } = await authApi.get('/auth/my-orders');
  return data;
};

export default authApi;
