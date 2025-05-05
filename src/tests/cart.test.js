const request = require('supertest');
const app = require('../server');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');

describe('Cart Endpoints', () => {
  let userToken;
  let adminToken;
  let otherUserToken;
  let testProduct;
  let userId;
  let otherUserId;

  const adminUser = {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'TestPass123!',
    role: 'admin'
  };

  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123!'
  };

  const otherUser = {
    name: 'Other User',
    email: 'other@test.com',
    password: 'TestPass123!'
  };

  const productData = {
    productName: 'Test Product',
    description: 'Test Description',
    supplier: {
      name: 'Test Supplier',
      code: 'SUP001'
    },
    supplierPrice: 99.99
  };

  beforeEach(async () => {
    // Create admin user
    await User.create(adminUser);
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password
      });
    adminToken = adminResponse.body.token;

    // Create regular user
    const user = await User.create(userData);
    userId = user._id;
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });
    userToken = loginResponse.body.token;

    // Create other user
    const other = await User.create(otherUser);
    otherUserId = other._id;
    const otherResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: otherUser.email,
        password: otherUser.password
      });
    otherUserToken = otherResponse.body.token;

    // Create test product
    testProduct = await Product.create(productData);
  });

  describe('GET /api/cart/all (Admin)', () => {
    it('should allow admin to get all carts', async () => {
      // Create carts for both users
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productGUID: testProduct.productGUID,
          quantity: 1
        });

      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          productGUID: testProduct.productGUID,
          quantity: 2
        });

      const res = await request(app)
        .get('/api/cart/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('user');
      expect(res.body[0].user).toHaveProperty('name');
      expect(res.body[0].user).toHaveProperty('email');
    });

    it('should not allow regular users to get all carts', async () => {
      const res = await request(app)
        .get('/api/cart/all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/cart', () => {
    it('should get empty cart for new user', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(0);
      expect(res.body.user).toBe(userId.toString());
    });

    it('should get existing cart', async () => {
      // First create a cart
      await Cart.create({
        user: userId,
        items: [{
          productGUID: testProduct.productGUID,
          productName: testProduct.productName,
          quantity: 2
        }]
      });

      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].quantity).toBe(2);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/cart/user/:userId (Admin)', () => {
    it('should allow admin to get specific user cart', async () => {
      // Create cart for user
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productGUID: testProduct.productGUID,
          quantity: 1
        });

      const res = await request(app)
        .get(`/api/cart/user/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user._id).toBe(userId.toString());
      expect(res.body.items).toHaveLength(1);
    });

    it('should not allow regular users to get other user carts', async () => {
      const res = await request(app)
        .get(`/api/cart/user/${otherUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should return 400 for invalid user ID', async () => {
      const res = await request(app)
        .get('/api/cart/user/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });
  });

  describe('POST /api/cart', () => {
    it('should add item to cart', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productGUID: testProduct.productGUID,
          quantity: 3
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].quantity).toBe(3);
      expect(res.body.items[0].productName).toBe(testProduct.productName);
    });

    it('should update quantity if item already exists', async () => {
      // First add item
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productGUID: testProduct.productGUID,
          quantity: 2
        });

      // Add same item again
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productGUID: testProduct.productGUID,
          quantity: 3
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].quantity).toBe(5);
    });

    it('should return 404 for non-existent product GUID', async () => {
      // Create and then delete a product to get a valid but non-existent UUID
      const product = await Product.create(productData);
      const validUUID = product.productGUID;
      await Product.findByIdAndDelete(product._id);

      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productGUID: validUUID,
          quantity: 1
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Product not found');
    });

    it('should return 400 for invalid product GUID format', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productGUID: 'invalid-guid',
          quantity: 1
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });
  });

  describe('POST /api/cart/user/:userId (Admin)', () => {
    it('should allow admin to add items to user cart', async () => {
      const res = await request(app)
        .post(`/api/cart/user/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productGUID: testProduct.productGUID,
          quantity: 3
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user._id).toBe(userId.toString());
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].quantity).toBe(3);
    });

    it('should not allow regular users to modify other user carts', async () => {
      const res = await request(app)
        .post(`/api/cart/user/${otherUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productGUID: testProduct.productGUID,
          quantity: 1
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/cart/items/:productGUID', () => {
    beforeEach(async () => {
      // Add item to cart
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productGUID: testProduct.productGUID,
          quantity: 2
        });
    });

    it('should update item quantity', async () => {
      const res = await request(app)
        .put(`/api/cart/items/${testProduct.productGUID}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 4 });

      expect(res.statusCode).toBe(200);
      expect(res.body.items[0].quantity).toBe(4);
    });

    it('should remove item when quantity is 0', async () => {
      const res = await request(app)
        .put(`/api/cart/items/${testProduct.productGUID}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 0 });

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(0);
    });

    it('should return 400 for invalid GUID format', async () => {
      const res = await request(app)
        .put('/api/cart/items/invalid-guid')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });

    it('should return 404 for valid but non-existent GUID', async () => {
      // Create and then delete a product to get a valid but non-existent UUID
      const product = await Product.create(productData);
      const validUUID = product.productGUID;
      await Product.findByIdAndDelete(product._id);

      const res = await request(app)
        .put(`/api/cart/items/${validUUID}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Item not found in cart');
    });
  });

  describe('DELETE /api/cart/items/:productGUID', () => {
    beforeEach(async () => {
      // Add item to cart
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productGUID: testProduct.productGUID,
          quantity: 2
        });
    });

    it('should remove item from cart', async () => {
      const res = await request(app)
        .delete(`/api/cart/items/${testProduct.productGUID}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(0);
    });

    it('should return 400 for invalid GUID format', async () => {
      const res = await request(app)
        .delete('/api/cart/items/invalid-guid')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });

    it('should return 404 for valid but non-existent GUID', async () => {
      // Create and then delete a product to get a valid but non-existent UUID
      const product = await Product.create(productData);
      const validUUID = product.productGUID;
      await Product.findByIdAndDelete(product._id);

      const res = await request(app)
        .delete(`/api/cart/items/${validUUID}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Item not found in cart');
    });
  });

  describe('DELETE /api/cart', () => {
    beforeEach(async () => {
      // Add items to cart
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productGUID: testProduct.productGUID,
          quantity: 2
        });
    });

    it('should clear cart', async () => {
      const res = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(0);
    });
  });
});
