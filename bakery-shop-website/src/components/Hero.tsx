import { storeInfo } from '../data/storeInfo';

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-20"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="animate-fade-in">
          <span className="text-6xl mb-6 block">🎂</span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {storeInfo.name}
          </h1>
          <p className="text-xl md:text-2xl mb-4 font-light">
            {storeInfo.slogan}
          </p>
          <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
            Khám phá hương vị tuyệt vời của những chiếc bánh được làm thủ công
            từ nguyên liệu cao cấp nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#products" className="btn-primary text-lg">
              Xem Sản Phẩm
            </a>
            <a href="#contact" className="btn-outline border-white text-white hover:bg-white hover:text-[var(--color-dark)]">
              Đặt Hàng Ngay
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;
