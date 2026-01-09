import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Products from './components/Products';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import CartSidebar from './components/CartSidebar';
import Checkout from './components/Checkout';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminStoreInfo from './pages/admin/StoreInfo';

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
        <CartProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* Shop routes */}
            <Route path="/" element={<ShopPage />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="store-info" element={<AdminStoreInfo />} />
            </Route>
          </Routes>
        </CartProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;
