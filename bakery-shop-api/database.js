const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'bakery.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image TEXT,
    category TEXT NOT NULL,
    is_new INTEGER DEFAULT 0,
    is_best_seller INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS store_info (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    slogan TEXT,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    weekday_hours TEXT,
    weekend_hours TEXT,
    facebook TEXT,
    instagram TEXT,
    zalo TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default categories if empty
const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (categoryCount.count === 0) {
  const insertCategory = db.prepare('INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)');
  const categories = [
    ['all', 'Tất cả', '🍰'],
    ['cake', 'Bánh kem', '🎂'],
    ['bread', 'Bánh mì', '🥖'],
    ['pastry', 'Bánh ngọt', '🥐'],
    ['cookie', 'Cookie', '🍪'],
    ['seasonal', 'Theo mùa', '🌸'],
  ];
  categories.forEach(cat => insertCategory.run(...cat));
  console.log('Seeded categories');
}

// Seed default store info if empty
const storeCount = db.prepare('SELECT COUNT(*) as count FROM store_info').get();
if (storeCount.count === 0) {
  db.prepare(`
    INSERT INTO store_info (id, name, slogan, description, address, phone, email, weekday_hours, weekend_hours, facebook, instagram, zalo)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Sweet Dreams Bakery',
    'Nơi những giấc mơ ngọt ngào thành hiện thực',
    'Chúng tôi là tiệm bánh với hơn 10 năm kinh nghiệm, chuyên cung cấp các loại bánh ngọt, bánh kem sinh nhật và bánh mì thủ công.',
    '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    '0901 234 567',
    'contact@sweetdreamsbakery.vn',
    '7:00 - 21:00',
    '7:00 - 22:00',
    'https://facebook.com/sweetdreamsbakery',
    'https://instagram.com/sweetdreamsbakery',
    'https://zalo.me/sweetdreamsbakery'
  );
  console.log('Seeded store info');
}

// Seed default products if empty
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (productCount.count === 0) {
  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, image, category, is_new, is_best_seller)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const products = [
    ['Bánh Kem Sinh Nhật Dâu Tây', 'Bánh kem tươi với lớp dâu tây tươi ngon, kem whipping mềm mịn', 350000, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 'cake', 0, 1],
    ['Bánh Kem Socola Đen', 'Bánh kem socola đậm đà với ganache socola Bỉ cao cấp', 380000, 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400', 'cake', 1, 0],
    ['Bánh Mì Bơ Tỏi', 'Bánh mì giòn thơm với bơ tỏi, nướng vàng đều', 25000, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400', 'bread', 0, 1],
    ['Croissant Bơ Pháp', 'Croissant lớp bơ thơm ngậy, giòn tan trong miệng', 35000, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 'pastry', 0, 0],
    ['Cookie Chocolate Chip', 'Cookie mềm với chip socola Bỉ, vị đậm đà', 15000, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', 'cookie', 0, 1],
    ['Bánh Tiramisu', 'Tiramisu chuẩn Ý với mascarpone cream và cà phê espresso', 65000, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 'pastry', 1, 0],
    ['Bánh Kem Trà Xanh Matcha', 'Bánh kem matcha Nhật Bản với đậu đỏ azuki', 420000, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400', 'cake', 0, 0],
    ['Bánh Mì Nguyên Cám', 'Bánh mì nguyên cám tốt cho sức khỏe, giàu chất xơ', 40000, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 'bread', 0, 0],
    ['Macaron Hộp 6 Viên', 'Macaron Pháp với 6 hương vị đa dạng', 120000, 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400', 'pastry', 0, 1],
    ['Bánh Tart Trứng', 'Bánh tart trứng Bồ Đào Nha với lớp vỏ giòn xốp', 28000, 'https://images.unsplash.com/photo-1584365685547-9a5fb6f3a70c?w=400', 'pastry', 0, 0],
    ['Bánh Kem Phô Mai', 'Cheesecake New York style với lớp phô mai cream béo ngậy', 75000, 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400', 'cake', 0, 0],
    ['Bánh Mì Sandwich', 'Bánh mì sandwich mềm mịn, phù hợp cho bữa sáng', 35000, 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400', 'bread', 0, 0],
  ];

  products.forEach(p => insertProduct.run(...p));
  console.log('Seeded products');
}

module.exports = db;
