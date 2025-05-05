const request = require('supertest');
const app = require('../server');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');

describe('Cart Endpoints', () => {
  let userToken;
  let testProduct;
  let userId;

  const userData = {
    name: 'Test User',
    email: 'test@example.com',
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
    // Create user
    const user = await User.create(userData);
    userId = user._id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });
    userToken = loginResponse.body.token;

    // Create test product
    testProduct = await Product.create(productData);
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

    it('should return 404 for valid but non-existent product GUID', async () => {
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
