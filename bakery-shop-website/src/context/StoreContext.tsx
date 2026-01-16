import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchProducts, fetchCategories, fetchStoreInfo } from '../services/api';
import { products as defaultProducts, categories as defaultCategories } from '../data/products';
import { storeInfo as defaultStoreInfo } from '../data/storeInfo';
import type { Product, Category, StoreInfo } from '../types';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  storeInfo: StoreInfo;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(defaultStoreInfo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData, storeInfoData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchStoreInfo(),
        ]);

        if (productsData.length > 0) {
          setProducts(productsData);
        }
        if (categoriesData.length > 0) {
          setCategories(categoriesData);
        }
        if (storeInfoData) {
          setStoreInfo(storeInfoData);
        }
      } catch (error) {
        console.error('Failed to load data from API, using defaults:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <StoreContext.Provider value={{ products, categories, storeInfo, loading }}>
      {children}
    </StoreContext.Provider>
  );
};
