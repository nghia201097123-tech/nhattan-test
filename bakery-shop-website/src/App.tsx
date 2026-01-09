import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { StoreProvider } from './context/StoreContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Products from './components/Products';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
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
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Shop routes */}
          <Route path="/" element={<ShopPage />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="store-info" element={<AdminStoreInfo />} />
          </Route>
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;
