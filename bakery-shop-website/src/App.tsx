import { StoreProvider } from './context/StoreContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Products from './components/Products';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <StoreProvider>
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
    </StoreProvider>
  );
}

export default App;
