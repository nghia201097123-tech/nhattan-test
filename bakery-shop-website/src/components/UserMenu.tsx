import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserMenu = () => {
  const { user, logout, openAuthModal, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  // Not logged in
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openAuthModal('login')}
          className="px-4 py-2 text-slate-700 hover:text-sky-500 font-medium transition-colors"
        >
          Đăng nhập
        </button>
        <button
          onClick={() => openAuthModal('register')}
          className="px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 font-medium transition-colors"
        >
          Đăng ký
        </button>
      </div>
    );
  }

  // Logged in
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-sky-50 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-sky-400 to-sky-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <span className="hidden md:block font-medium text-slate-700 max-w-[120px] truncate">
          {user.name}
        </span>
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-slate-800 truncate">{user.name}</p>
            <p className="text-sm text-slate-500 truncate">{user.email}</p>
            {isAdmin && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                Admin
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-sky-50 transition-colors"
            >
              <span className="text-lg">👤</span>
              <span>Tài khoản của tôi</span>
            </Link>
            <Link
              to="/profile?tab=orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-sky-50 transition-colors"
            >
              <span className="text-lg">📋</span>
              <span>Đơn hàng của tôi</span>
            </Link>

            {isAdmin && (
              <>
                <div className="border-t border-slate-100 my-1"></div>
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-sky-50 transition-colors"
                >
                  <span className="text-lg">⚙️</span>
                  <span>Quản trị</span>
                </Link>
              </>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
