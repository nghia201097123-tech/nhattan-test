import { useStore } from '../context/StoreContext';

const Hero = () => {
  const { storeInfo } = useStore();
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
    >
      {/* Sky gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 z-0" />

      {/* Clouds decoration */}
      <div className="absolute top-20 left-10 w-32 h-16 bg-white rounded-full opacity-80 blur-sm" />
      <div className="absolute top-24 left-20 w-24 h-12 bg-white rounded-full opacity-70 blur-sm" />
      <div className="absolute top-32 right-20 w-40 h-20 bg-white rounded-full opacity-80 blur-sm" />
      <div className="absolute top-36 right-32 w-28 h-14 bg-white rounded-full opacity-70 blur-sm" />
      <div className="absolute top-1/3 left-1/4 w-48 h-24 bg-white rounded-full opacity-60 blur-md" />
      <div className="absolute top-1/4 right-1/3 w-36 h-18 bg-white rounded-full opacity-50 blur-md" />

      {/* Sun decoration */}
      <div className="absolute top-32 right-1/4 w-24 h-24 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full opacity-90 blur-sm shadow-2xl" />
      <div className="absolute top-32 right-1/4 w-24 h-24 bg-yellow-200 rounded-full opacity-40 blur-xl animate-pulse" />

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-lg border border-sky-200">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-sky-700">Bánh tươi mỗi ngày</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="block text-white drop-shadow-lg">Chào mừng đến với</span>
            <span className="block mt-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-lg">
              {storeInfo.name}
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-4 font-light text-white drop-shadow-md">
            {storeInfo.slogan}
          </p>

          <p className="text-lg max-w-2xl mx-auto mb-10 text-sky-800 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
            Khám phá hương vị tuyệt vời của những chiếc bánh được làm thủ công
            từ nguyên liệu cao cấp nhất
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#products" className="btn-accent text-lg inline-flex items-center justify-center gap-2 shadow-xl">
              <span>🍰</span>
              Xem Sản Phẩm
            </a>
            <a href="#contact" className="bg-white text-sky-600 px-6 py-3 rounded-full font-semibold hover:bg-sky-50 transition-all shadow-xl inline-flex items-center justify-center gap-2">
              <span>📞</span>
              Đặt Hàng Ngay
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-2xl md:text-3xl font-bold text-sky-500">10+</div>
              <div className="text-xs text-slate-600">Năm kinh nghiệm</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-2xl md:text-3xl font-bold text-amber-500">50+</div>
              <div className="text-xs text-slate-600">Loại bánh</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-2xl md:text-3xl font-bold text-sky-500">5K+</div>
              <div className="text-xs text-slate-600">Khách hài lòng</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-sky-600 rounded-full flex justify-center pt-2 bg-white/50 backdrop-blur-sm">
            <div className="w-1.5 h-3 bg-amber-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
