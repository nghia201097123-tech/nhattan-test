import { storeInfo } from '../data/storeInfo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-dark)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🧁</span>
              <span className="text-xl font-bold">{storeInfo.name}</span>
            </div>
            <p className="text-gray-400 text-sm">
              {storeInfo.slogan}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên Kết Nhanh</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-gray-400 hover:text-white transition-colors">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#products" className="text-gray-400 hover:text-white transition-colors">
                  Sản phẩm
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Sản Phẩm</h4>
            <ul className="space-y-2">
              <li>
                <a href="#products" className="text-gray-400 hover:text-white transition-colors">
                  Bánh kem sinh nhật
                </a>
              </li>
              <li>
                <a href="#products" className="text-gray-400 hover:text-white transition-colors">
                  Bánh cưới
                </a>
              </li>
              <li>
                <a href="#products" className="text-gray-400 hover:text-white transition-colors">
                  Bánh mì thủ công
                </a>
              </li>
              <li>
                <a href="#products" className="text-gray-400 hover:text-white transition-colors">
                  Bánh ngọt Pháp
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên Hệ</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span className="text-sm">{storeInfo.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href={`tel:${storeInfo.phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                  {storeInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span>
                <a href={`mailto:${storeInfo.email}`} className="hover:text-white transition-colors text-sm">
                  {storeInfo.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} {storeInfo.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            {storeInfo.socialMedia.facebook && (
              <a
                href={storeInfo.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Facebook
              </a>
            )}
            {storeInfo.socialMedia.instagram && (
              <a
                href={storeInfo.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Instagram
              </a>
            )}
            {storeInfo.socialMedia.zalo && (
              <a
                href={storeInfo.socialMedia.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Zalo
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
