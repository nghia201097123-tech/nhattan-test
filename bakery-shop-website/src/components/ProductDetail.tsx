import { useState } from 'react';
import { useCart } from '../context/CartContext';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const ProductDetail = () => {
  const { selectedProduct, closeProductDetail, addToCart, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  if (!selectedProduct) return null;

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, note);
    closeProductDetail();
    openCart();
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity, note);
    closeProductDetail();
    // Will trigger checkout
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeProductDetail}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={closeProductDetail}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition-all shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative h-72 md:h-full min-h-[400px]">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {selectedProduct.isNew && (
                <span className="bg-gradient-to-r from-sky-400 to-sky-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                  Mới
                </span>
              )}
              {selectedProduct.isBestSeller && (
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                  Bán chạy
                </span>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-6 md:p-8 flex flex-col">
            {/* Category */}
            <span className="inline-block w-fit px-3 py-1 bg-sky-100 text-sky-600 rounded-full text-sm font-medium mb-3">
              {selectedProduct.category === 'cake' && '🎂 Bánh kem'}
              {selectedProduct.category === 'bread' && '🥖 Bánh mì'}
              {selectedProduct.category === 'pastry' && '🥐 Bánh ngọt'}
              {selectedProduct.category === 'cookie' && '🍪 Cookie'}
              {selectedProduct.category === 'seasonal' && '🌸 Theo mùa'}
            </span>

            {/* Name */}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
              {selectedProduct.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-sky-500">
                {formatPrice(selectedProduct.price)}
              </span>
            </div>

            {/* Description */}
            <p className="text-slate-600 leading-relaxed mb-6">
              {selectedProduct.description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">✓</span>
                <span>Nguyên liệu tươi</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">✓</span>
                <span>Làm trong ngày</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">✓</span>
                <span>Giao hàng nhanh</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">✓</span>
                <span>Đảm bảo chất lượng</span>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Số lượng</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center text-xl font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors"
                >
                  +
                </button>
                <span className="ml-4 text-lg font-semibold text-amber-600">
                  = {formatPrice(selectedProduct.price * quantity)}
                </span>
              </div>
            </div>

            {/* Note */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Không đường, viết chữ lên bánh..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all resize-none text-sm"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                className="flex-1 px-6 py-3.5 border-2 border-sky-500 text-sky-500 rounded-xl font-semibold hover:bg-sky-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 rounded-xl font-semibold hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
