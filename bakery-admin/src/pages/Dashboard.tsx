import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsApi } from '../services/api';
import type { Stats } from '../types';

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await statsApi.get();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { label: 'Tổng sản phẩm', value: stats.totalProducts, icon: '📦', color: 'bg-sky-500' },
    { label: 'Đang hoạt động', value: stats.activeProducts, icon: '✅', color: 'bg-emerald-500' },
    { label: 'Danh mục', value: stats.categories, icon: '📂', color: 'bg-amber-500' },
    { label: 'Bán chạy', value: stats.bestSellers, icon: '⭐', color: 'bg-rose-500' },
  ] : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600">Chào mừng đến với trang quản trị Bakery Shop</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="card">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center text-2xl text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-slate-500 text-sm">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/products"
                className="flex items-center gap-4 p-4 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors"
              >
                <span className="text-3xl">🍰</span>
                <div>
                  <p className="font-semibold text-slate-800">Quản lý sản phẩm</p>
                  <p className="text-sm text-slate-500">Thêm, sửa, xóa sản phẩm</p>
                </div>
              </Link>

              <Link
                to="/store-info"
                className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <span className="text-3xl">🏪</span>
                <div>
                  <p className="font-semibold text-slate-800">Thông tin cửa hàng</p>
                  <p className="text-sm text-slate-500">Cập nhật thông tin liên hệ</p>
                </div>
              </Link>

              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                <span className="text-3xl">🌐</span>
                <div>
                  <p className="font-semibold text-slate-800">Xem trang web</p>
                  <p className="text-sm text-slate-500">Mở trang khách hàng</p>
                </div>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
