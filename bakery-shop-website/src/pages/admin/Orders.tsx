import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface OrderItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  note?: string;
}

interface Order {
  id: number;
  order_code: string;
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  delivery_date: string;
  delivery_time: string;
  payment_method: string;
  note?: string;
  status: string;
  total_price: number;
  created_at: string;
  items: OrderItem[];
}

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

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'text-amber-600', bg: 'bg-amber-100' },
  confirmed: { label: 'Đã xác nhận', color: 'text-sky-600', bg: 'bg-sky-100' },
  preparing: { label: 'Đang chuẩn bị', color: 'text-purple-600', bg: 'bg-purple-100' },
  delivering: { label: 'Đang giao', color: 'text-blue-600', bg: 'bg-blue-100' },
  completed: { label: 'Hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  cancelled: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-100' },
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      const url = filterStatus
        ? `http://localhost:3001/api/orders?status=${filterStatus}`
        : 'http://localhost:3001/api/orders';
      const response = await fetch(url);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success('Cập nhật trạng thái thành công!');
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const deleteOrder = async (orderId: number) => {
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;
    try {
      await fetch(`http://localhost:3001/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      toast.success('Đã xóa đơn hàng');
      loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Quản lý đơn hàng</h1>
          <p className="text-slate-600">Xem và xử lý các đơn đặt hàng</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusConfig).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Chưa có đơn hàng</h3>
          <p className="text-slate-500">Đơn hàng sẽ xuất hiện ở đây khi khách đặt hàng</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2 space-y-4">
            {orders.map((order) => (
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

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <span>👤</span>
                    <span>{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <span>📞</span>
                    <span>{order.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <span>📦</span>
                    <span>{order.items.length} sản phẩm</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>🚚</span>
                    <span>Giao: {order.delivery_date} ({order.delivery_time})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Detail */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="bg-white rounded-2xl shadow-sm sticky top-24">
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800">Chi tiết đơn hàng</h3>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sky-500 font-semibold">{selectedOrder.order_code}</p>
                </div>

                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                  {/* Status Update */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
                    >
                      {Object.entries(statusConfig).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-slate-50 rounded-xl p-3">
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                      <span>👤</span> Khách hàng
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-600">{selectedOrder.customer_name}</p>
                      <p className="text-slate-600">{selectedOrder.phone}</p>
                      {selectedOrder.email && <p className="text-slate-600">{selectedOrder.email}</p>}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-slate-50 rounded-xl p-3">
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                      <span>🚚</span> Giao hàng
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-600">{selectedOrder.address}</p>
                      <p className="text-slate-600">
                        <strong>Ngày:</strong> {selectedOrder.delivery_date} ({selectedOrder.delivery_time})
                      </p>
                      <p className="text-slate-600">
                        <strong>Thanh toán:</strong> {selectedOrder.payment_method === 'cod' ? 'Tiền mặt khi nhận' : 'Chuyển khoản'}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                      <span>📦</span> Sản phẩm
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm bg-slate-50 rounded-lg p-2">
                          <div>
                            <p className="text-slate-800">{item.product_name}</p>
                            <p className="text-slate-500">x{item.quantity}</p>
                            {item.note && <p className="text-xs text-slate-400">📝 {item.note}</p>}
                          </div>
                          <p className="font-medium text-slate-800">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  {selectedOrder.note && (
                    <div className="bg-amber-50 rounded-xl p-3">
                      <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                        <span>📝</span> Ghi chú
                      </h4>
                      <p className="text-sm text-slate-600">{selectedOrder.note}</p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="bg-sky-50 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">Tổng cộng</span>
                      <span className="text-xl font-bold text-sky-500">{formatPrice(selectedOrder.total_price)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-slate-100">
                  <button
                    onClick={() => deleteOrder(selectedOrder.id)}
                    className="w-full py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm"
                  >
                    🗑️ Xóa đơn hàng
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
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
  );
};

export default Orders;
