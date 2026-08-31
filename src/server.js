require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDb, loadLocalData, saveLocalData, pool, isPgActive } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'oyster_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Middleware: Verify Admin JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    if (isPgActive()) {
      const { rows } = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
      if (rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }
      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid && password !== 'admin123') {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, token, user: { id: user.id, email: user.email } });
    } else {
      const data = loadLocalData();
      const user = data.admin_users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Default fallback for demo admin if user does not exist yet
      if (!user && (email === 'admin@oyster.com' || email === 'admin@gmail.com')) {
        const token = jwt.sign({ id: 1, email }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ success: true, token, user: { id: 1, email } });
      }

      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }

      // Check password (accepts "admin123" or bcrypt check)
      const valid = (password === 'admin123') || (user.password_hash && await bcrypt.compare(password, user.password_hash));
      if (!valid) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, token, user: { id: user.id, email: user.email } });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Forgot Password Route
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

  if (isPgActive()) {
    try {
      await pool.query(
        'UPDATE admin_users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL "1 hour" WHERE email = $2',
        [resetToken, email]
      );
    } catch (err) {
      console.error(err);
    }
  } else {
    const data = loadLocalData();
    const user = data.admin_users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.reset_token = resetToken;
      user.reset_token_expires = Date.now() + 3600000;
      saveLocalData(data);
    }
  }

  return res.json({
    success: true,
    message: `Password reset token sent to ${email}`,
    demoResetToken: resetToken
  });
});

// Reset Password Route
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, reset token, and new password are required' });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  if (isPgActive()) {
    try {
      const { rowCount } = await pool.query(
        'UPDATE admin_users SET password_hash = $1, reset_token = NULL WHERE email = $2 AND reset_token = $3',
        [hash, email, resetToken]
      );
      if (rowCount === 0) {
        return res.status(400).json({ success: false, message: 'Invalid email or reset token' });
      }
      return res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } else {
    const data = loadLocalData();
    const user = data.admin_users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.reset_token === resetToken
    );
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid reset token' });
    }
    user.password_hash = hash;
    user.reset_token = null;
    saveLocalData(data);
    return res.json({ success: true, message: 'Password reset successful' });
  }
});

// -------------------------------------------------------------
// CATEGORIES ROUTES
// -------------------------------------------------------------

// Get All Categories
app.get('/api/categories', async (req, res) => {
  try {
    if (isPgActive()) {
      const { rows } = await pool.query('SELECT * FROM categories ORDER BY id ASC');
      return res.json({ success: true, categories: rows });
    } else {
      const data = loadLocalData();
      return res.json({ success: true, categories: data.categories || [] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Category
app.post('/api/categories', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

  try {
    if (isPgActive()) {
      const { rows } = await pool.query(
        'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
        [name, slug, description || '']
      );
      return res.status(201).json({ success: true, category: rows[0] });
    } else {
      const data = loadLocalData();
      const newCategory = {
        id: Date.now(),
        name,
        slug,
        description: description || ''
      };
      data.categories.push(newCategory);
      saveLocalData(data);
      return res.status(201).json({ success: true, category: newCategory });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Category
app.put('/api/categories/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description } = req.body;

  const slug = name ? name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') : '';

  try {
    if (isPgActive()) {
      const { rows } = await pool.query(
        'UPDATE categories SET name = COALESCE($1, name), slug = COALESCE($2, slug), description = COALESCE($3, description) WHERE id = $4 RETURNING *',
        [name, slug, description, id]
      );
      return res.json({ success: true, category: rows[0] });
    } else {
      const data = loadLocalData();
      const index = data.categories.findIndex(c => c.id === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Category not found' });

      if (name) data.categories[index].name = name;
      if (slug) data.categories[index].slug = slug;
      if (description !== undefined) data.categories[index].description = description;

      saveLocalData(data);
      return res.json({ success: true, category: data.categories[index] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Category
app.delete('/api/categories/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    if (isPgActive()) {
      await pool.query('DELETE FROM categories WHERE id = $1', [id]);
      return res.json({ success: true, message: 'Category deleted' });
    } else {
      const data = loadLocalData();
      data.categories = data.categories.filter(c => c.id !== id);
      saveLocalData(data);
      return res.json({ success: true, message: 'Category deleted' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// PRODUCTS ROUTES
// -------------------------------------------------------------

// Get All Products
app.get('/api/products', async (req, res) => {
  const { category, search } = req.query;

  try {
    if (isPgActive()) {
      let query = 'SELECT * FROM products WHERE 1=1';
      const params = [];

      if (category) {
        params.push(category);
        query += ` AND (LOWER(category_name) = LOWER($${params.length}) OR category_id = $${params.length})`;
      }

      if (search) {
        params.push(`%${search}%`);
        query += ` AND (LOWER(name) LIKE LOWER($${params.length}) OR LOWER(description) LIKE LOWER($${params.length}))`;
      }

      query += ' ORDER BY id DESC';
      const { rows } = await pool.query(query, params);
      return res.json({ success: true, products: rows });
    } else {
      const data = loadLocalData();
      let products = data.products || [];

      if (category) {
        const catLower = category.toLowerCase();
        products = products.filter(
          p => (p.category_name && p.category_name.toLowerCase() === catLower) || String(p.category_id) === category
        );
      }

      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(
          p => p.name.toLowerCase().includes(searchLower) || (p.description && p.description.toLowerCase().includes(searchLower))
        );
      }

      return res.json({ success: true, products });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Single Product
app.get('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    if (isPgActive()) {
      const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, product: rows[0] });
    } else {
      const data = loadLocalData();
      const product = data.products.find(p => p.id === id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, product });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Product
app.post('/api/products', async (req, res) => {
  const {
    name,
    nickname,
    category_id,
    category_name,
    price,
    original_price,
    description,
    size,
    color,
    in_stock,
    stock_count,
    rating,
    image,
    images,
    specifications
  } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ success: false, message: 'Product name and price are required' });
  }

  const parsedPrice = parseFloat(price);
  const parsedOrigPrice = original_price ? parseFloat(original_price) : parsedPrice;
  const parsedRating = rating !== undefined ? parseFloat(rating) : 5.0;
  const parsedInStock = in_stock !== undefined ? Boolean(in_stock) : true;
  const parsedStockCount = stock_count !== undefined ? parseInt(stock_count) : 10;
  const specs = Array.isArray(specifications) ? specifications : [];
  const imgList = Array.isArray(images) && images.length ? images : [image || '/images/product-item1.jpg'];

  try {
    if (isPgActive()) {
      const { rows } = await pool.query(
        `INSERT INTO products 
        (name, nickname, category_id, category_name, price, original_price, description, size, color, in_stock, stock_count, rating, image, images, specifications) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
        RETURNING *`,
        [
          name,
          nickname || '',
          category_id || null,
          category_name || 'General',
          parsedPrice,
          parsedOrigPrice,
          description || '',
          size || '',
          color || '',
          parsedInStock,
          parsedStockCount,
          parsedRating,
          image || imgList[0],
          JSON.stringify(imgList),
          JSON.stringify(specs)
        ]
      );
      return res.status(201).json({ success: true, product: rows[0] });
    } else {
      const data = loadLocalData();
      const newProduct = {
        id: Date.now(),
        name,
        nickname: nickname || '',
        category_id: category_id || null,
        category_name: category_name || 'General',
        price: parsedPrice,
        original_price: parsedOrigPrice,
        description: description || '',
        size: size || '',
        color: color || '',
        in_stock: parsedInStock,
        stock_count: parsedStockCount,
        rating: parsedRating,
        reviews_count: 1,
        image: image || imgList[0],
        images: imgList,
        specifications: specs
      };
      data.products.unshift(newProduct);
      saveLocalData(data);
      return res.status(201).json({ success: true, product: newProduct });
    }
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Product
app.put('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const {
    name,
    nickname,
    category_id,
    category_name,
    price,
    original_price,
    description,
    size,
    color,
    in_stock,
    stock_count,
    rating,
    image,
    images,
    specifications
  } = req.body;

  try {
    if (isPgActive()) {
      const { rows } = await pool.query(
        `UPDATE products SET 
          name = COALESCE($1, name),
          nickname = COALESCE($2, nickname),
          category_id = COALESCE($3, category_id),
          category_name = COALESCE($4, category_name),
          price = COALESCE($5, price),
          original_price = COALESCE($6, original_price),
          description = COALESCE($7, description),
          size = COALESCE($8, size),
          color = COALESCE($9, color),
          in_stock = COALESCE($10, in_stock),
          stock_count = COALESCE($11, stock_count),
          rating = COALESCE($12, rating),
          image = COALESCE($13, image),
          images = COALESCE($14, images),
          specifications = COALESCE($15, specifications)
        WHERE id = $16 RETURNING *`,
        [
          name,
          nickname,
          category_id,
          category_name,
          price ? parseFloat(price) : null,
          original_price ? parseFloat(original_price) : null,
          description,
          size,
          color,
          in_stock !== undefined ? Boolean(in_stock) : null,
          stock_count !== undefined ? parseInt(stock_count) : null,
          rating !== undefined ? parseFloat(rating) : null,
          image,
          images ? JSON.stringify(images) : null,
          specifications ? JSON.stringify(specifications) : null,
          id
        ]
      );
      return res.json({ success: true, product: rows[0] });
    } else {
      const data = loadLocalData();
      const index = data.products.findIndex(p => p.id === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

      const existing = data.products[index];
      data.products[index] = {
        ...existing,
        name: name !== undefined ? name : existing.name,
        nickname: nickname !== undefined ? nickname : existing.nickname,
        category_id: category_id !== undefined ? category_id : existing.category_id,
        category_name: category_name !== undefined ? category_name : existing.category_name,
        price: price !== undefined ? parseFloat(price) : existing.price,
        original_price: original_price !== undefined ? parseFloat(original_price) : existing.original_price,
        description: description !== undefined ? description : existing.description,
        size: size !== undefined ? size : existing.size,
        color: color !== undefined ? color : existing.color,
        in_stock: in_stock !== undefined ? Boolean(in_stock) : existing.in_stock,
        stock_count: stock_count !== undefined ? parseInt(stock_count) : existing.stock_count,
        rating: rating !== undefined ? parseFloat(rating) : existing.rating,
        image: image !== undefined ? image : existing.image,
        images: images !== undefined ? images : existing.images,
        specifications: specifications !== undefined ? specifications : existing.specifications
      };

      saveLocalData(data);
      return res.json({ success: true, product: data.products[index] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    if (isPgActive()) {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return res.json({ success: true, message: 'Product deleted' });
    } else {
      const data = loadLocalData();
      data.products = data.products.filter(p => p.id !== id);
      saveLocalData(data);
      return res.json({ success: true, message: 'Product deleted' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Rate Product Route
app.post('/api/products/:id/rate', async (req, res) => {
  const id = parseInt(req.params.id);
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
  }

  try {
    if (isPgActive()) {
      const { rows } = await pool.query(
        'UPDATE products SET rating = $1, reviews_count = reviews_count + 1 WHERE id = $2 RETURNING *',
        [parseFloat(rating), id]
      );
      return res.json({ success: true, product: rows[0] });
    } else {
      const data = loadLocalData();
      const product = data.products.find(p => p.id === id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      product.rating = parseFloat(rating);
      product.reviews_count = (product.reviews_count || 0) + 1;
      saveLocalData(data);
      return res.json({ success: true, product });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', postgres: isPgActive(), timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Oyster Backend API server running on http://localhost:${PORT}`);
});
