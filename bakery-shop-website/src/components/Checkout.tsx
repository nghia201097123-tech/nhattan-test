import { useState } from 'react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

interface OrderForm {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: 'cod' | 'bank';
  note: string;
}

const Checkout = () => {
  const { items, isCheckoutOpen, closeCheckout, totalPrice, clearCart, openCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState<OrderForm>({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    deliveryDate: '',
    deliveryTime: '09:00',
    paymentMethod: 'cod',
    note: '',
  });

  if (!isCheckoutOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        ...formData,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          note: item.note,
        })),
        totalPrice,
      };

      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Failed to create order');

      const result = await response.json();
      setOrderId(result.orderCode);
      setOrderSuccess(true);
      clearCart();
      toast.success('Đặt hàng thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (orderSuccess) {
      setOrderSuccess(false);
      setOrderId(null);
    }
    closeCheckout();
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {orderSuccess ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Đặt hàng thành công!</h2>
            <p className="text-slate-600 mb-4">
              Cảm ơn bạn đã đặt hàng tại Sweet Dreams Bakery
            </p>
            <div className="bg-sky-50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-slate-600">Mã đơn hàng của bạn</p>
              <p className="text-2xl font-bold text-sky-500">{orderId}</p>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Chúng tôi sẽ liên hệ với bạn sớm để xác nhận đơn hàng.
              Vui lòng giữ điện thoại để nhận cuộc gọi từ chúng tôi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800">Đặt hàng</h2>
              <p className="text-slate-500">Điền thông tin để hoàn tất đơn hàng</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">Đơn hàng của bạn</h3>
                  <button
                    type="button"
                    onClick={() => { closeCheckout(); openCart(); }}
                    className="text-sm text-sky-500 hover:text-sky-600"
                  >
                    Chỉnh sửa
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        {item.product.name} x{item.quantity}
                        {item.note && <span className="text-slate-400 ml-1">({item.note})</span>}
                      </span>
                      <span className="font-medium text-slate-800">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between">
                  <span className="font-bold text-slate-800">Tổng cộng</span>
                  <span className="font-bold text-sky-500">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center text-sky-500">1</span>
                  Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all"
                      placeholder="0901 234 567"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center text-sky-500">2</span>
                  Thông tin giao hàng
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Địa chỉ giao hàng <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all resize-none"
                      rows={2}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, thành phố"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Ngày nhận hàng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={minDate}
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Giờ nhận hàng <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.deliveryTime}
                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all"
                      >
                        <option value="08:00">08:00 - 10:00</option>
                        <option value="10:00">10:00 - 12:00</option>
                        <option value="14:00">14:00 - 16:00</option>
                        <option value="16:00">16:00 - 18:00</option>
                        <option value="18:00">18:00 - 20:00</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center text-sky-500">3</span>
                  Phương thức thanh toán
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'cod'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.paymentMethod === 'cod' ? 'border-sky-500' : 'border-slate-300'
                    }`}>
                      {formData.paymentMethod === 'cod' && (
                        <div className="w-3 h-3 rounded-full bg-sky-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">Thanh toán khi nhận hàng</p>
                      <p className="text-sm text-slate-500">Trả tiền mặt khi nhận bánh</p>
                    </div>
                    <span className="text-2xl">💵</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'bank'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={formData.paymentMethod === 'bank'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'bank' })}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.paymentMethod === 'bank' ? 'border-sky-500' : 'border-slate-300'
                    }`}>
                      {formData.paymentMethod === 'bank' && (
                        <div className="w-3 h-3 rounded-full bg-sky-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">Chuyển khoản ngân hàng</p>
                      <p className="text-sm text-slate-500">Chuyển khoản trước khi nhận</p>
                    </div>
                    <span className="text-2xl">🏦</span>
                  </label>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú đơn hàng</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all resize-none"
                  rows={2}
                  placeholder="Ghi chú thêm về đơn hàng (nếu có)"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 rounded-xl font-bold text-lg hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span>Xác nhận đặt hàng</span>
                    <span className="text-lg">•</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                Bằng việc đặt hàng, bạn đồng ý với điều khoản dịch vụ của chúng tôi
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
