import { storeInfo } from '../data/storeInfo';

const About = () => {
  const features = [
    {
      icon: '🌿',
      title: 'Nguyên liệu tươi ngon',
      description: 'Chúng tôi chỉ sử dụng nguyên liệu tươi mới nhất, được chọn lọc kỹ càng',
    },
    {
      icon: '👨‍🍳',
      title: 'Thợ làm bánh chuyên nghiệp',
      description: 'Đội ngũ thợ bánh với hơn 10 năm kinh nghiệm trong ngành',
    },
    {
      icon: '🚚',
      title: 'Giao hàng nhanh chóng',
      description: 'Giao hàng trong ngày, đảm bảo bánh luôn tươi ngon',
    },
    {
      icon: '💝',
      title: 'Dịch vụ tận tâm',
      description: 'Chúng tôi luôn lắng nghe và phục vụ khách hàng tốt nhất',
    },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Về Chúng Tôi</h2>
        <p className="section-subtitle">
          {storeInfo.description}
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-[var(--color-accent)] hover:shadow-lg transition-shadow"
            >
              <span className="text-5xl mb-4 block">{feature.icon}</span>
              <h3 className="text-xl font-bold mb-2 text-[var(--color-dark)]">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Store Image Gallery */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <img
              src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800"
              alt="Tiệm bánh"
              className="w-full h-80 object-cover rounded-xl shadow-lg"
            />
          </div>
          <div className="space-y-6">
            <img
              src="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400"
              alt="Bánh ngọt"
              className="w-full h-36 object-cover rounded-xl shadow-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400"
              alt="Bánh mì"
              className="w-full h-36 object-cover rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
