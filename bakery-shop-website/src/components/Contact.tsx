import { storeInfo } from '../data/storeInfo';

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Liên Hệ & Đặt Hàng</h2>
        <p className="section-subtitle">
          Liên hệ với chúng tôi để đặt bánh hoặc được tư vấn về sản phẩm phù hợp nhất cho bạn
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-[var(--color-accent)] p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-6">
                Thông Tin Liên Hệ
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold">Địa chỉ</p>
                    <p className="text-gray-600">{storeInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="font-semibold">Hotline đặt hàng</p>
                    <a href={`tel:${storeInfo.phone.replace(/\s/g, '')}`} className="text-[var(--color-primary)] hover:underline text-lg font-bold">
                      {storeInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href={`mailto:${storeInfo.email}`} className="text-[var(--color-primary)] hover:underline">
                      {storeInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-2xl">🕐</span>
                  <div>
                    <p className="font-semibold">Giờ mở cửa</p>
                    <p className="text-gray-600">Thứ 2 - Thứ 6: {storeInfo.openingHours.weekdays}</p>
                    <p className="text-gray-600">Thứ 7 - Chủ nhật: {storeInfo.openingHours.weekend}</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8 pt-6 border-t border-[var(--color-primary)]/20">
                <p className="font-semibold mb-4">Theo dõi chúng tôi</p>
                <div className="flex gap-4">
                  {storeInfo.socialMedia.facebook && (
                    <a
                      href={storeInfo.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      f
                    </a>
                  )}
                  {storeInfo.socialMedia.instagram && (
                    <a
                      href={storeInfo.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      IG
                    </a>
                  )}
                  {storeInfo.socialMedia.zalo && (
                    <a
                      href={storeInfo.socialMedia.zalo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      Zalo
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-[var(--color-primary)]/10 p-6 rounded-xl border-2 border-[var(--color-primary)]">
              <h4 className="text-xl font-bold text-[var(--color-dark)] mb-4">
                📋 Hướng Dẫn Đặt Hàng
              </h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)]">✓</span>
                  Đặt bánh kem sinh nhật trước ít nhất 24 giờ
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)]">✓</span>
                  Đặt cọc 50% giá trị đơn hàng
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)]">✓</span>
                  Miễn phí giao hàng trong bán kính 5km
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary)]">✓</span>
                  Hỗ trợ thiết kế bánh theo yêu cầu
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-6">
              Gửi Yêu Cầu Đặt Hàng
            </h3>

            <form className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                  Sản phẩm quan tâm
                </label>
                <select
                  id="product"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
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
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày nhận hàng
                </label>
                <input
                  type="date"
                  id="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú / Yêu cầu đặc biệt
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none resize-none"
                  placeholder="Nhập yêu cầu của bạn (kích thước, hương vị, chữ viết trên bánh...)"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary text-lg py-4"
              >
                Gửi Yêu Cầu Đặt Hàng
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="mt-12">
          <div className="bg-gray-200 h-80 rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-500">
              <span className="text-4xl block mb-2">🗺️</span>
              <p>Google Maps sẽ được hiển thị tại đây</p>
              <p className="text-sm">{storeInfo.address}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
