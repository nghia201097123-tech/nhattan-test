import type { Product, Category, StoreInfo } from '../types';

const API_URL = 'http://localhost:3001/api';

// Products API
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products?active_only=true`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

// Categories API
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

// Store Info API
export const fetchStoreInfo = async (): Promise<StoreInfo | null> => {
  try {
    const response = await fetch(`${API_URL}/store-info`);
    if (!response.ok) throw new Error('Failed to fetch store info');
    return response.json();
  } catch (error) {
    console.error('Failed to fetch store info:', error);
    return null;
  }
};
