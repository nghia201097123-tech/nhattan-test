import { storeInfo } from '../data/storeInfo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🧁</span>
              </div>
              <span className="text-xl font-bold">{storeInfo.name}</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {storeInfo.slogan}
            </p>
            <div className="mt-6 flex gap-3">
              {storeInfo.socialMedia.facebook && (
                <a
                  href={storeInfo.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-all"
                >
                  f
                </a>
              )}
              {storeInfo.socialMedia.instagram && (
                <a
                  href={storeInfo.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 rounded-lg flex items-center justify-center transition-all"
                >
                  IG
                </a>
              )}
              {storeInfo.socialMedia.zalo && (
                <a
                  href={storeInfo.socialMedia.zalo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-all text-xs"
                >
                  Zalo
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-amber-400 rounded-full"></span>
              Liên Kết Nhanh
            </h4>
            <ul className="space-y-3">
              {['Trang chủ', 'Về chúng tôi', 'Sản phẩm', 'Liên hệ'].map((item, index) => (
                <li key={index}>
                  <a
                    href={`#${['home', 'about', 'products', 'contact'][index]}`}
                    className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:bg-amber-400 transition-colors"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-amber-400 rounded-full"></span>
              Sản Phẩm
            </h4>
            <ul className="space-y-3">
              {['Bánh kem sinh nhật', 'Bánh cưới', 'Bánh mì thủ công', 'Bánh ngọt Pháp'].map((item, index) => (
                <li key={index}>
                  <a
                    href="#products"
                    className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:bg-amber-400 transition-colors"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-amber-400 rounded-full"></span>
              Liên Hệ
            </h4>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-sm">📍</span>
                <span className="text-sm">{storeInfo.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-sm">📞</span>
                <a href={`tel:${storeInfo.phone.replace(/\s/g, '')}`} className="hover:text-amber-400 transition-colors">
                  {storeInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-sm">📧</span>
                <a href={`mailto:${storeInfo.email}`} className="hover:text-amber-400 transition-colors text-sm">
                  {storeInfo.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {currentYear} <span className="text-amber-400">{storeInfo.name}</span>. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Chính sách bảo mật</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
