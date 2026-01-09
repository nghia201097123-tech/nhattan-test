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
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Mới
          </span>
        )}
        {product.isBestSeller && (
          <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Bán chạy
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-[var(--color-dark)] mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-[var(--color-primary)]">
            {formatPrice(product.price)}
          </span>
          <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-secondary)] transition-colors">
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
    <section id="products" className="py-20 bg-[var(--color-light)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Sản Phẩm Của Chúng Tôi</h2>
        <p className="section-subtitle">
          Khám phá bộ sưu tập bánh ngọt đa dạng, từ bánh kem sinh nhật đến bánh mì thủ công
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2 rounded-full font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white text-gray-700 hover:bg-[var(--color-accent)]'
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
          <a href="#contact" className="btn-outline inline-block">
            Xem thêm sản phẩm
          </a>
        </div>
      </div>
    </section>
  );
};

export default Products;
