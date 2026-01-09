import { useState } from 'react';
import { products, categories } from '../data/products';
import type { Product } from '../types';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="card group">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {product.isNew && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            Mới
          </span>
        )}
        {product.isBestSeller && (
          <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            Bán chạy
          </span>
        )}

        {/* Quick action button */}
        <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-blue-600 px-6 py-2 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600 hover:text-white shadow-xl transform translate-y-4 group-hover:translate-y-0">
          Xem chi tiết
        </button>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>
          <button className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-4 py-2 rounded-full font-semibold hover:from-amber-500 hover:to-amber-600 transition-all shadow-md hover:shadow-lg">
            Đặt ngay
          </button>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(product => product.category === activeCategory);

  return (
    <section id="products" className="py-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-blue-100 rounded-full -translate-x-1/2 blur-3xl opacity-40" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-yellow-100 rounded-full translate-x-1/2 blur-3xl opacity-40" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-semibold mb-4">
            Menu Của Chúng Tôi
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Sản Phẩm <span className="text-blue-600">Đặc Biệt</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Khám phá bộ sưu tập bánh ngọt đa dạng, từ bánh kem sinh nhật đến bánh mì thủ công
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 shadow-md'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a href="#contact" className="btn-primary inline-flex items-center gap-2">
            <span>Xem thêm sản phẩm</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Products;
