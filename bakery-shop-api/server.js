const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ============== PRODUCTS API ==============

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const { category, active_only } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];

    const conditions = [];
    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }
    if (active_only === 'true') {
      conditions.push('is_active = 1');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const products = db.prepare(query).all(...params);

    // Transform to match frontend format
    const transformed = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category: p.category,
      isNew: p.is_new === 1,
      isBestSeller: p.is_best_seller === 1,
      isActive: p.is_active === 1,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
      ...product,
      isNew: product.is_new === 1,
      isBestSeller: product.is_best_seller === 1,
      isActive: product.is_active === 1,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post('/api/products', (req, res) => {
  try {
    const { name, description, price, image, category, isNew, isBestSeller } = req.body;

    const result = db.prepare(`
      INSERT INTO products (name, description, price, image, category, is_new, is_best_seller)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, description, price, image, category, isNew ? 1 : 0, isBestSeller ? 1 : 0);

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', (req, res) => {
  try {
    const { name, description, price, image, category, isNew, isBestSeller, isActive } = req.body;

    db.prepare(`
      UPDATE products
      SET name = ?, description = ?, price = ?, image = ?, category = ?,
          is_new = ?, is_best_seller = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, description, price, image, category, isNew ? 1 : 0, isBestSeller ? 1 : 0, isActive !== false ? 1 : 0, req.params.id);

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== CATEGORIES API ==============

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY id').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== STORE INFO API ==============

// Get store info
app.get('/api/store-info', (req, res) => {
  try {
    const info = db.prepare('SELECT * FROM store_info WHERE id = 1').get();
    if (!info) {
      return res.status(404).json({ error: 'Store info not found' });
    }

    // Transform to match frontend format
    res.json({
      name: info.name,
      slogan: info.slogan,
      description: info.description,
      address: info.address,
      phone: info.phone,
      email: info.email,
      openingHours: {
        weekdays: info.weekday_hours,
        weekend: info.weekend_hours,
      },
      socialMedia: {
        facebook: info.facebook,
        instagram: info.instagram,
        zalo: info.zalo,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update store info
app.put('/api/store-info', (req, res) => {
  try {
    const { name, slogan, description, address, phone, email, openingHours, socialMedia } = req.body;

    db.prepare(`
      UPDATE store_info
      SET name = ?, slogan = ?, description = ?, address = ?, phone = ?, email = ?,
          weekday_hours = ?, weekend_hours = ?, facebook = ?, instagram = ?, zalo = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      name, slogan, description, address, phone, email,
      openingHours?.weekdays, openingHours?.weekend,
      socialMedia?.facebook, socialMedia?.instagram, socialMedia?.zalo
    );

    res.json({ message: 'Store info updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== STATS API ==============

app.get('/api/stats', (req, res) => {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const activeProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get().count;
    const categories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    const bestSellers = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_best_seller = 1').get().count;

    res.json({
      totalProducts,
      activeProducts,
      categories,
      bestSellers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bakery API running at http://localhost:${PORT}`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`🏪 Store Info API: http://localhost:${PORT}/api/store-info`);
});
