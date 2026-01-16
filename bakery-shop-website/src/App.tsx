import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Products from './components/Products';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import CartSidebar from './components/CartSidebar';
import Checkout from './components/Checkout';
import AuthModal from './components/AuthModal';
import Profile from './pages/Profile';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminStoreInfo from './pages/admin/StoreInfo';

// Protected route wrapper for admin routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Shop landing page component
const ShopPage = () => (
  <div className="min-h-screen">
    <Header />
    <main>
      <Hero />
      <About />
      <Products />
      <Contact />
    </main>
    <Footer />
    {/* Modals */}
    <ProductDetail />
    <CartSidebar />
    <Checkout />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-right" />
            <Routes>
              {/* Shop routes */}
              <Route path="/" element={<ShopPage />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin routes - protected */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="store-info" element={<AdminStoreInfo />} />
              </Route>
            </Routes>
            {/* Global Modals */}
            <AuthModal />
          </CartProvider>
        </AuthProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;
