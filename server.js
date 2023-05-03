const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
require('./auth');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();

// 使用 body-parser 中间件来解析请求主体
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 获取所有产品
app.get('/products', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取某一类产品
app.get('/products', async (req, res) => {
    try {
      const categoryId = req.query.category;
      let query = 'SELECT * FROM products';
      const queryParams = [];
  
      if (categoryId) {
        query += ' WHERE category_id = $1';
        queryParams.push(categoryId);
      }
  
      const result = await db.query(query, queryParams);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
// 获取某一产品
  app.get('/products/:productId', async (req, res) => {
    try {
      const productId = req.params.productId;
      const query = 'SELECT * FROM products WHERE id = $1';
      const result = await db.query(query, [productId]);
      const product = result.rows[0];
  
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.json(product);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

// 创建新产品
app.post('/products', async (req, res) => {
    const product = req.body;
    console.log('Product data received:', product);
  
    try {
      const insertQuery = `
        INSERT INTO products (name, description, price, stock)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
  
      const result = await db.query(insertQuery, [product.name, product.description, product.price, product.stock]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // 更新产品
  app.put('/products/:id', async (req, res) => {
    const productId = req.params.id;
    const updatedProduct = req.body;
    console.log('Product data received for update:', updatedProduct);
  
    try {
      const updateQuery = `
        UPDATE products
        SET name = $1, description = $2, price = $3, stock = $4
        WHERE id = $5
        RETURNING *;
      `;
  
      const result = await db.query(updateQuery, [updatedProduct.name, updatedProduct.description, updatedProduct.price, updatedProduct.stock, productId]);
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// 删除产品
app.delete('/products/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const deleteQuery = 'DELETE FROM products WHERE id = $1';
    await db.query(deleteQuery, [productId]);
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 用户登录
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
  
    // 检查用户是否已经存在
    const userExists = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rowCount > 0) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }
  
    // 对密码进行哈希处理并将用户数据存储到数据库中
    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const insertQuery = `
        INSERT INTO users (username, password, email)
        VALUES ($1, $2, $3)
        RETURNING id, username, email;
      `;
      const result = await db.query(insertQuery, [username, hashedPassword, email]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 用户登录
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const userQuery = 'SELECT * FROM users WHERE username = $1';
      const result = await db.query(userQuery, [username]);
      const user = result.rows[0];
  
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
  
      // TODO: Replace this with your password hashing/checking logic
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
  
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // 用户登录
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const userQuery = 'SELECT * FROM users WHERE id = $1';
      const result = await db.query(userQuery, [id]);
      const user = result.rows[0];
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // 用户登录
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/', // Redirect to the homepage on successful login
    failureRedirect: '/login', // Redirect back to the login page on failure
    failureFlash: true // Display error messages
  }));
  

  app.get('/users', async (req, res) => {
    try {
      const query = 'SELECT * FROM users';
      const result = await db.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/users/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await db.query(query, [userId]);
      const user = result.rows[0];
  
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(user);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.put('/users/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const updatedUser = req.body;
      console.log('User data received for update:', updatedUser);
  
      const updateQuery = `
        UPDATE users
        SET username = $1, email = $2
        WHERE id = $3
        RETURNING *;
      `;
  
      const result = await db.query(updateQuery, [updatedUser.username, updatedUser.email, userId]);
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  app.use(passport.initialize());
app.use(passport.session());

app.post('/cart', async (req, res) => {
    const userId = req.body.userId;
  
    try {
      const query = `
        INSERT INTO carts (user_id)
        VALUES ($1)
        RETURNING *;
      `;
      const result = await db.query(query, [userId]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/cart/:cartId', async (req, res) => {
    const cartId = req.params.cartId;
    const { productId, quantity } = req.body;
  
    try {
      const query = `
        INSERT INTO cart_items (cart_id, product_id, quantity)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const result = await db.query(query, [cartId, productId, quantity]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/cart/:cartId', async (req, res) => {
    const cartId = req.params.cartId;
  
    try {
      const query = `
        SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, p.name, p.description, p.price
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1;
      `;
      const result = await db.query(query, [cartId]);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post('/cart/:cartId/checkout', async (req, res) => {
    const cartId = req.params.cartId;
    const userId = req.body.userId;
  
    try {
      // 验证购物车存在
      const cartQuery = 'SELECT * FROM carts WHERE id = $1';
      const cartResult = await db.query(cartQuery, [cartId]);
  
      if (cartResult.rowCount === 0) {
        res.status(404).json({ error: 'Cart not found' });
        return;
      }
  
      // 获取购物车中的所有项目
      const cartItemsQuery = 'SELECT * FROM cart_items WHERE cart_id = $1';
      const cartItemsResult = await db.query(cartItemsQuery, [cartId]);
  
      // 处理付款（在这个阶段，我们假设所有付款都成功）
  
      // 创建订单
      const orderQuery = `
        INSERT INTO orders (user_id)
        VALUES ($1)
        RETURNING *;
      `;
      const orderResult = await db.query(orderQuery, [userId]);
      const orderId = orderResult.rows[0].id;
  
      // 将购物车中的项目添加到订单项中
      const orderItemsQuery = `
        INSERT INTO order_items (order_id, product_id, quantity)
        SELECT $1, product_id, quantity
        FROM cart_items
        WHERE cart_id = $2
      `;
      await db.query(orderItemsQuery, [orderId, cartId]);
  
      // 清空购物车
      const clearCartQuery = 'DELETE FROM cart_items WHERE cart_id = $1';
      await db.query(clearCartQuery, [cartId]);
  
      res.status(200).json({ message: 'Checkout successful', order_id: orderId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/orders', async (req, res) => {
    try {
      // 获取当前登录用户的 ID
      const userId = req.user.id;
  
      // 查询数据库以获取用户的所有订单
      const result = await db.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
  
      // 返回订单列表
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/orders/:orderId', async (req, res) => {
    try {
      // 获取订单 ID 和当前登录用户的 ID
      const orderId = req.params.orderId;
      const userId = req.user.id;
  
      // 查询数据库以获取指定订单的详细信息
      const result = await db.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [orderId, userId]);
  
      // 检查订单是否找到并属于当前用户
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      // 返回订单详情
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.use(passport.initialize());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // 登录成功，重定向到主页或其他页面
    res.redirect('/');
  }
);

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
      // 登录成功，重定向到主页或其他页面
      res.redirect('/');
    }
  );

  app.use(
    session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
    })
  );

  app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // 检查用户凭据，例如从数据库中查找用户
    // 以及验证密码
    const user = authenticate(username, password);
  
    if (user) {
      // 登录成功，将用户信息存储到会话中
      req.session.user = user;
  
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  });
  // 退出登录
  app.get('/logout', (req, res) => {
    req.session.destroy(); // 销毁 session
    res.status(200).json({ message: 'Logout successful' });
  });
  
  app.use(cors());