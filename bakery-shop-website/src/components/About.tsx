import { storeInfo } from '../data/storeInfo';

const About = () => {
  const features = [
    {
      icon: '🌿',
      title: 'Nguyên liệu tươi ngon',
      description: 'Chúng tôi chỉ sử dụng nguyên liệu tươi mới nhất, được chọn lọc kỹ càng',
      color: 'from-green-400 to-emerald-500',
    },
    {
      icon: '👨‍🍳',
      title: 'Thợ làm bánh chuyên nghiệp',
      description: 'Đội ngũ thợ bánh với hơn 10 năm kinh nghiệm trong ngành',
      color: 'from-blue-400 to-blue-600',
    },
    {
      icon: '🚚',
      title: 'Giao hàng nhanh chóng',
      description: 'Giao hàng trong ngày, đảm bảo bánh luôn tươi ngon',
      color: 'from-amber-400 to-orange-500',
    },
    {
      icon: '💝',
      title: 'Dịch vụ tận tâm',
      description: 'Chúng tôi luôn lắng nghe và phục vụ khách hàng tốt nhất',
      color: 'from-pink-400 to-rose-500',
    },
  ];

  return (
    <section id="about" className="py-20 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-100 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
            Về Chúng Tôi
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Câu Chuyện Của <span className="text-blue-600">Sweet Dreams</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {storeInfo.description}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Store Image Gallery */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 relative group">
            <img
              src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800"
              alt="Tiệm bánh"
              className="w-full h-80 object-cover rounded-2xl shadow-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
              <div className="text-white">
                <p className="font-bold text-xl">Không gian cửa hàng</p>
                <p className="text-blue-100">Ấm cúng & hiện đại</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="relative group">
              <img
                src="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400"
                alt="Bánh ngọt"
                className="w-full h-36 object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white font-semibold">Bánh tươi mỗi ngày</p>
              </div>
            </div>
            <div className="relative group">
              <img
                src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400"
                alt="Bánh mì"
                className="w-full h-36 object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white font-semibold">Nguyên liệu cao cấp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
