import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import * as authApi from '../services/authApi';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  oauthLogin: (provider: 'google' | 'facebook', providerId: string, email: string, name: string, avatar?: string) => Promise<void>;
  updateProfile: (profile: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = authApi.getAccessToken();
      if (token) {
        try {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
        } catch {
          authApi.clearTokens();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setUser(response.user);
    setIsAuthModalOpen(false);
  };

  const register = async (email: string, password: string, name: string, phone?: string) => {
    const response = await authApi.register(email, password, name, phone);
    setUser(response.user);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const oauthLogin = async (provider: 'google' | 'facebook', providerId: string, email: string, name: string, avatar?: string) => {
    const response = await authApi.oauthLogin(provider, providerId, email, name, avatar);
    setUser(response.user);
    setIsAuthModalOpen(false);
  };

  const updateProfile = async (profile: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) => {
    const updatedUser = await authApi.updateProfile(profile);
    setUser(updatedUser);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthModalOpen,
      authModalMode,
      login,
      register,
      logout,
      oauthLogin,
      updateProfile,
      openAuthModal,
      closeAuthModal,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
