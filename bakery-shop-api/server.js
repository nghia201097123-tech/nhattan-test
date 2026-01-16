const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'bakery-shop-secret-key-change-in-production';
const JWT_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

// Generate tokens
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// ============== AUTH API ==============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, name, phone, role, provider)
      VALUES (?, ?, ?, ?, 'customer', 'local')
    `).run(email, passwordHash, name, phone || null);

    const user = db.prepare('SELECT id, email, name, phone, role, avatar, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Store refresh token
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, refreshToken, expiresAt);

    res.status(201).json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND provider = ?').get(email, 'local');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Store refresh token
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, refreshToken, expiresAt);

    // Return user without password
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh token
app.post('/api/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Find and validate refresh token
    const tokenRecord = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(refreshToken);
    if (!tokenRecord) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if expired
    if (new Date(tokenRecord.expires_at) < new Date()) {
      db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(tokenRecord.id);
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Get user
    const user = db.prepare('SELECT id, email, name, phone, role, avatar FROM users WHERE id = ?').get(tokenRecord.user_id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, phone, role, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required to change password' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);
      db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(passwordHash, userId);
    }

    // Update name and phone
    if (name || phone) {
      db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, phone, userId);
    }

    const updatedUser = db.prepare('SELECT id, email, name, phone, role, avatar, created_at FROM users WHERE id = ?').get(userId);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OAuth Login - Google/Facebook
app.post('/api/auth/oauth', async (req, res) => {
  try {
    const { provider, providerId, email, name, avatar } = req.body;

    if (!provider || !providerId || !email || !name) {
      return res.status(400).json({ error: 'Missing required OAuth fields' });
    }

    if (!['google', 'facebook'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Check if user exists with this provider
    let user = db.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?').get(provider, providerId);

    if (!user) {
      // Check if email already exists with different provider
      const existingEmailUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingEmailUser) {
        return res.status(400).json({ error: 'Email already registered with different method' });
      }

      // Create new user
      const result = db.prepare(`
        INSERT INTO users (email, name, provider, provider_id, avatar, role)
        VALUES (?, ?, ?, ?, ?, 'customer')
      `).run(email, name, provider, providerId, avatar || null);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Store refresh token
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, refreshToken, expiresAt);

    // Return user without password
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer's orders
app.get('/api/auth/my-orders', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const orders = db.prepare('SELECT * FROM orders WHERE email = ? ORDER BY created_at DESC').all(user.email);

    // Get items for each order
    const ordersWithItems = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });

    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== ADMIN USER MANAGEMENT ==============

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT id, email, name, phone, role, provider, avatar, is_active, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role (admin only)
app.put('/api/admin/users/:id/role', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent admin from changing their own role
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(role, req.params.id);
    const user = db.prepare('SELECT id, email, name, phone, role, provider, is_active FROM users WHERE id = ?').get(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle user active status (admin only)
app.put('/api/admin/users/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    db.prepare('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(isActive ? 1 : 0, req.params.id);
    const user = db.prepare('SELECT id, email, name, phone, role, provider, is_active FROM users WHERE id = ?').get(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get().count;

    res.json({
      totalProducts,
      activeProducts,
      categories,
      bestSellers,
      totalOrders,
      pendingOrders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== ORDERS API ==============

// Generate order code
const generateOrderCode = () => {
  const date = new Date();
  const prefix = 'SD';
  const timestamp = date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
};

// Create order
app.post('/api/orders', (req, res) => {
  try {
    const { customerName, phone, email, address, deliveryDate, deliveryTime, paymentMethod, note, items, totalPrice } = req.body;

    // Generate unique order code
    let orderCode = generateOrderCode();

    // Insert order
    const result = db.prepare(`
      INSERT INTO orders (order_code, customer_name, phone, email, address, delivery_date, delivery_time, payment_method, note, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderCode, customerName, phone, email || '', address, deliveryDate, deliveryTime, paymentMethod, note || '', totalPrice);

    const orderId = result.lastInsertRowid;

    // Insert order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, price, quantity, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItem.run(orderId, item.productId, item.productName, item.price, item.quantity, item.note || '');
    }

    res.status(201).json({ orderId, orderCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders
app.get('/api/orders', (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM orders';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';

    const orders = db.prepare(query).all(...params);

    // Get items for each order
    const ordersWithItems = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return {
        ...order,
        items,
      };
    });

    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
app.get('/api/orders/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    res.json({ ...order, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.prepare(`
      UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(status, req.params.id);

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM order_items WHERE order_id = ?').run(req.params.id);
    db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
    res.json({ message: 'Order deleted successfully' });
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
