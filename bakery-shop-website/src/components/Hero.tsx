import { storeInfo } from '../data/storeInfo';

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
    >
      {/* Background with gradient overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-slate-900/80 z-10" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl z-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl z-10" />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium">Bánh tươi mỗi ngày</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="block">Chào mừng đến với</span>
            <span className="block mt-2 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              {storeInfo.name}
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-4 font-light text-blue-100">
            {storeInfo.slogan}
          </p>

          <p className="text-lg max-w-2xl mx-auto mb-10 text-slate-300">
            Khám phá hương vị tuyệt vời của những chiếc bánh được làm thủ công
            từ nguyên liệu cao cấp nhất
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#products" className="btn-accent text-lg inline-flex items-center justify-center gap-2">
              <span>🍰</span>
              Xem Sản Phẩm
            </a>
            <a href="#contact" className="btn-outline border-white text-white hover:bg-white hover:text-blue-600 inline-flex items-center justify-center gap-2">
              <span>📞</span>
              Đặt Hàng Ngay
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">10+</div>
              <div className="text-sm text-slate-300">Năm kinh nghiệm</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">50+</div>
              <div className="text-sm text-slate-300">Loại bánh</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">5K+</div>
              <div className="text-sm text-slate-300">Khách hài lòng</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
