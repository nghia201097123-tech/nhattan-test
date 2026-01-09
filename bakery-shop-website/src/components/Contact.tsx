import { useStore } from '../context/StoreContext';

const Contact = () => {
  const { storeInfo } = useStore();
  return (
    <section id="contact" className="py-20 bg-white relative overflow-hidden">
      {/* Decorative clouds */}
      <div className="absolute top-0 left-1/4 w-96 h-48 bg-sky-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 right-1/4 w-72 h-36 bg-amber-100 rounded-full blur-3xl opacity-40" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-sky-100 text-sky-600 rounded-full text-sm font-semibold mb-4">
            Liên Hệ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Đặt Hàng & <span className="text-amber-500">Liên Hệ</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Liên hệ với chúng tôi để đặt bánh hoặc được tư vấn về sản phẩm phù hợp nhất cho bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-sky-400 to-sky-500 p-8 rounded-3xl text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">
                Thông Tin Liên Hệ
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sky-100">Địa chỉ</p>
                    <p className="text-white">{storeInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sky-100">Hotline đặt hàng</p>
                    <a href={`tel:${storeInfo.phone.replace(/\s/g, '')}`} className="text-amber-300 hover:text-amber-200 text-xl font-bold transition-colors">
                      {storeInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sky-100">Email</p>
                    <a href={`mailto:${storeInfo.email}`} className="text-white hover:text-amber-300 transition-colors">
                      {storeInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🕐</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sky-100">Giờ mở cửa</p>
                    <p className="text-white">Thứ 2 - Thứ 6: {storeInfo.openingHours.weekdays}</p>
                    <p className="text-white">Thứ 7 - Chủ nhật: {storeInfo.openingHours.weekend}</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="font-semibold mb-4 text-sky-100">Theo dõi chúng tôi</p>
                <div className="flex gap-3">
                  {storeInfo.socialMedia.facebook && (
                    <a
                      href={storeInfo.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-white text-sky-500 rounded-xl flex items-center justify-center hover:bg-amber-400 hover:text-slate-900 transition-all shadow-lg font-bold"
                    >
                      f
                    </a>
                  )}
                  {storeInfo.socialMedia.instagram && (
                    <a
                      href={storeInfo.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-white text-pink-500 rounded-xl flex items-center justify-center hover:bg-amber-400 hover:text-slate-900 transition-all shadow-lg font-bold"
                    >
                      IG
                    </a>
                  )}
                  {storeInfo.socialMedia.zalo && (
                    <a
                      href={storeInfo.socialMedia.zalo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-white text-sky-400 rounded-xl flex items-center justify-center hover:bg-amber-400 hover:text-slate-900 transition-all shadow-lg text-xs font-bold"
                    >
                      Zalo
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border-2 border-amber-200">
              <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center">📋</span>
                Hướng Dẫn Đặt Hàng
              </h4>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">✓</span>
                  Đặt bánh kem sinh nhật trước ít nhất 24 giờ
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">✓</span>
                  Đặt cọc 50% giá trị đơn hàng
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">✓</span>
                  Miễn phí giao hàng trong bán kính 5km
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">✓</span>
                  Hỗ trợ thiết kế bánh theo yêu cầu
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-sky-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              Gửi Yêu Cầu <span className="text-sky-500">Đặt Hàng</span>
            </h3>

            <form className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label htmlFor="product" className="block text-sm font-semibold text-slate-700 mb-2">
                  Sản phẩm quan tâm
                </label>
                <select
                  id="product"
                  className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all"
                >
                  <option value="">Chọn loại bánh</option>
                  <option value="birthday-cake">Bánh kem sinh nhật</option>
                  <option value="wedding-cake">Bánh cưới</option>
                  <option value="cupcake">Cupcake</option>
                  <option value="bread">Bánh mì</option>
                  <option value="pastry">Bánh ngọt khác</option>
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-slate-700 mb-2">
                  Ngày nhận hàng
                </label>
                <input
                  type="date"
                  id="date"
                  className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                  Ghi chú / Yêu cầu đặc biệt
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all resize-none"
                  placeholder="Nhập yêu cầu của bạn (kích thước, hương vị, chữ viết trên bánh...)"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-sky-400 text-white text-lg py-4 rounded-xl font-semibold hover:from-sky-600 hover:to-sky-500 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
              >
                Gửi Yêu Cầu Đặt Hàng
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="mt-16">
          <div className="bg-gradient-to-br from-sky-100 to-sky-50 h-80 rounded-3xl flex items-center justify-center shadow-inner border border-sky-200">
            <div className="text-center text-slate-500">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-4xl">🗺️</span>
              </div>
              <p className="font-semibold text-slate-700">Google Maps sẽ được hiển thị tại đây</p>
              <p className="text-sm mt-1">{storeInfo.address}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
