import { useState } from 'react';
import { storeInfo } from '../data/storeInfo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '#home', label: 'Trang chủ' },
    { href: '#about', label: 'Về chúng tôi' },
    { href: '#products', label: 'Sản phẩm' },
    { href: '#contact', label: 'Liên hệ' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2">
            <span className="text-3xl">🧁</span>
            <span className="text-xl md:text-2xl font-bold text-[var(--color-secondary)]">
              {storeInfo.name}
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-[var(--color-primary)] font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="tel:0901234567"
              className="btn-primary flex items-center gap-2"
            >
              <span>📞</span>
              <span>Đặt hàng</span>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-100">
            <div className="flex flex-col gap-2 pt-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-[var(--color-primary)] font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="tel:0901234567"
                className="btn-primary text-center mt-2"
              >
                📞 Đặt hàng ngay
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
