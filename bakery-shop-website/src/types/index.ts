export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
  isBestSeller?: boolean;
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
