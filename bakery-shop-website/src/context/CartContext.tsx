import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  selectedProduct: Product | null;
  addToCart: (product: Product, quantity?: number, note?: string) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateNote: (productId: number, note: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1, note?: string) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, note: note || item.note }
            : item
        );
      }
      return [...prev, { product, quantity, note }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateNote = (productId: number, note: string) => {
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, note } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const openCart = () => {
    setIsCartOpen(true);
    setSelectedProduct(null);
  };
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsCartOpen(false);
  };
  const closeProductDetail = () => setSelectedProduct(null);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      isCartOpen,
      isCheckoutOpen,
      selectedProduct,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateNote,
      clearCart,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      openProductDetail,
      closeProductDetail,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
