import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../services/authApi';
import type { Order } from '../types';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'text-amber-600', bg: 'bg-amber-100' },
  confirmed: { label: 'Đã xác nhận', color: 'text-sky-600', bg: 'bg-sky-100' },
  preparing: { label: 'Đang chuẩn bị', color: 'text-purple-600', bg: 'bg-purple-100' },
  delivering: { label: 'Đang giao', color: 'text-blue-600', bg: 'bg-blue-100' },
  completed: { label: 'Hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  cancelled: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-100' },
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Profile = () => {
  const { user, updateProfile, isLoading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Update form when user loads
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // Load orders when tab changes
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      loadOrders();
    }
  }, [activeTab, user]);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'orders', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone || undefined,
      });
      toast.success('Cập nhật thông tin thành công!');
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.currentPassword || !profileForm.newPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (profileForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        currentPassword: profileForm.currentPassword,
        newPassword: profileForm.newPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sky-100 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại trang chủ
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-sky-100">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'profile', label: 'Thông tin cá nhân', icon: '👤' },
            { id: 'orders', label: 'Đơn hàng', icon: '📋' },
            { id: 'security', label: 'Bảo mật', icon: '🔒' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-sky-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Thông tin cá nhân</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-500"
                />
                <p className="text-xs text-slate-500 mt-1">Email không thể thay đổi</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
                  placeholder="0901 234 567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phương thức đăng nhập</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl">
                  {user.provider === 'google' && <span className="text-lg">🔵</span>}
                  {user.provider === 'facebook' && <span className="text-lg">🔷</span>}
                  {user.provider === 'local' && <span className="text-lg">📧</span>}
                  <span className="text-slate-600 capitalize">{user.provider}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📋</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Chưa có đơn hàng</h3>
                <p className="text-slate-500 mb-4">Bạn chưa có đơn hàng nào</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-600 transition-colors"
                >
                  Mua sắm ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Orders List */}
                <div className="space-y-4">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-white rounded-2xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                        selectedOrder?.id === order.id ? 'ring-2 ring-sky-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sky-500">{order.order_code}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status]?.bg} ${statusConfig[order.status]?.color}`}>
                              {statusConfig[order.status]?.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">{formatDate(order.created_at)}</p>
                        </div>
                        <span className="font-bold text-lg text-slate-800">{formatPrice(order.total_price)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>📦 {order.items.length} sản phẩm</span>
                        <span>🚚 {order.delivery_date}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Detail */}
                <div className="lg:sticky lg:top-24">
                  {selectedOrder ? (
                    <div className="bg-white rounded-2xl shadow-sm">
                      <div className="p-4 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg text-slate-800">Chi tiết đơn hàng</h3>
                          <button
                            onClick={() => setSelectedOrder(null)}
                            className="text-slate-400 hover:text-slate-600 lg:hidden"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-sky-500 font-semibold">{selectedOrder.order_code}</p>
                      </div>
                      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig[selectedOrder.status]?.bg} ${statusConfig[selectedOrder.status]?.color}`}>
                          <span className="font-medium">{statusConfig[selectedOrder.status]?.label}</span>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3">
                          <h4 className="font-semibold text-slate-800 mb-2">🚚 Giao hàng</h4>
                          <div className="space-y-1 text-sm text-slate-600">
                            <p>{selectedOrder.address}</p>
                            <p><strong>Ngày:</strong> {selectedOrder.delivery_date} ({selectedOrder.delivery_time})</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-800 mb-2">📦 Sản phẩm</h4>
                          <div className="space-y-2">
                            {selectedOrder.items.map(item => (
                              <div key={item.id} className="flex justify-between text-sm bg-slate-50 rounded-lg p-2">
                                <div>
                                  <p className="text-slate-800">{item.product_name}</p>
                                  <p className="text-slate-500">x{item.quantity}</p>
                                </div>
                                <p className="font-medium text-slate-800">{formatPrice(item.price * item.quantity)}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-sky-50 rounded-xl p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-800">Tổng cộng</span>
                            <span className="text-xl font-bold text-sky-500">{formatPrice(selectedOrder.total_price)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm p-8 text-center hidden lg:block">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">👆</span>
                      </div>
                      <p className="text-slate-500">Chọn đơn hàng để xem chi tiết</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Bảo mật</h2>

            {user.provider !== 'local' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800">
                  Bạn đang đăng nhập bằng {user.provider === 'google' ? 'Google' : 'Facebook'}.
                  Vui lòng quản lý mật khẩu trên nền tảng đó.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
