import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { path: '/admin/orders', label: 'Đơn hàng', icon: '📋' },
    { path: '/admin/products', label: 'Sản phẩm', icon: '🍰' },
    { path: '/admin/store-info', label: 'Thông tin cửa hàng', icon: '🏪' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-sky-600 to-sky-700 text-white flex flex-col">
        <div className="p-6 border-b border-sky-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center">
              <span className="text-xl">🧁</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Admin Panel</h1>
              <p className="text-xs text-sky-200">Bakery Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-sky-100 hover:bg-white/10'
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-sky-500">
          <a
            href="/"
            className="flex items-center gap-2 text-sky-200 hover:text-white transition-colors"
          >
            <span>🌐</span>
            <span className="text-sm">Xem trang web</span>
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-slate-100 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
