import axios from 'axios';
import type { Product, Category, StoreInfo, Stats } from '../types';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsApi = {
  getAll: async (activeOnly = false): Promise<Product[]> => {
    const { data } = await api.get(`/products${activeOnly ? '?active_only=true' : ''}`);
    return data;
  },

  getById: async (id: number): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const { data } = await api.post('/products', product);
    return data;
  },

  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    const { data } = await api.put(`/products/${id}`, product);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories');
    return data;
  },
};

// Store Info API
export const storeInfoApi = {
  get: async (): Promise<StoreInfo> => {
    const { data } = await api.get('/store-info');
    return data;
  },

  update: async (info: StoreInfo): Promise<void> => {
    await api.put('/store-info', info);
  },
};

// Stats API
export const statsApi = {
  get: async (): Promise<Stats> => {
    const { data } = await api.get('/stats');
    return data;
  },
};

export default api;
