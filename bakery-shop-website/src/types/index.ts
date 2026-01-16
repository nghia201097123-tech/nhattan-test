export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface StoreInfo {
  name: string;
  slogan: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  openingHours: {
    weekdays: string;
    weekend: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    zalo?: string;
  };
}

export interface Stats {
  totalProducts: number;
  activeProducts: number;
  categories: number;
  bestSellers: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'customer';
  provider: 'local' | 'google' | 'facebook';
  avatar?: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Order {
  id: number;
  order_code: string;
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  delivery_date: string;
  delivery_time: string;
  payment_method: string;
  note?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  total_price: number;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  note?: string;
}
