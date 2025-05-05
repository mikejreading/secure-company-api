const request = require('supertest');
const app = require('../server');
const User = require('../models/user.model');
const Product = require('../models/product.model');

describe('Product Endpoints', () => {
  let adminToken;
  let userToken;
  let testProduct;

  const adminUser = {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'TestPass123!',
    role: 'admin'
  };

  const regularUser = {
    name: 'Regular User',
    email: 'user@test.com',
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
    await User.create(regularUser);
    const userResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: regularUser.email,
        password: regularUser.password
      });
    userToken = userResponse.body.token;

    // Create test product
    testProduct = await Product.create(productData);
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].productName).toBe(productData.productName);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product when admin', async () => {
      const newProduct = {
        productName: 'New Product',
        description: 'New Description',
        supplier: {
          name: 'New Supplier',
          code: 'SUP002'
        },
        supplierPrice: 149.99
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct);

      expect(res.statusCode).toBe(201);
      expect(res.body.productName).toBe(newProduct.productName);
      expect(res.body.productGUID).toBeDefined();
    });

    it('should not allow regular users to create products', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData);

      expect(res.statusCode).toBe(403);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation error');
    });
  });

  describe('GET /api/products/:productGUID', () => {
    it('should get product by GUID', async () => {
      const res = await request(app)
        .get(`/api/products/${testProduct.productGUID}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.productGUID).toBe(testProduct.productGUID);
    });

    it('should return 404 for valid but non-existent UUID', async () => {
      // Create and then delete a product to get a valid but non-existent UUID
      const product = await Product.create(productData);
      const validUUID = product.productGUID;
      await Product.findByIdAndDelete(product._id);

      const res = await request(app)
        .get(`/api/products/${validUUID}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
    });

    it('should return 400 for invalid UUID format', async () => {
      const res = await request(app)
        .get('/api/products/invalid-guid')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });
  });

  describe('PUT /api/products/:productGUID', () => {
    it('should update product when admin', async () => {
      const update = {
        productName: 'Updated Product',
        supplierPrice: 199.99
      };

      const res = await request(app)
        .put(`/api/products/${testProduct.productGUID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(update);

      expect(res.statusCode).toBe(200);
      expect(res.body.productName).toBe(update.productName);
      expect(res.body.supplierPrice).toBe(update.supplierPrice);
    });

    it('should not allow regular users to update products', async () => {
      const res = await request(app)
        .put(`/api/products/${testProduct.productGUID}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productName: 'Updated' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/products/:productGUID', () => {
    it('should delete product when admin', async () => {
      const res = await request(app)
        .delete(`/api/products/${testProduct.productGUID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);

      // Verify deletion
      const verifyRes = await request(app)
        .get(`/api/products/${testProduct.productGUID}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(verifyRes.statusCode).toBe(404);
    });

    it('should not allow regular users to delete products', async () => {
      const res = await request(app)
        .delete(`/api/products/${testProduct.productGUID}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
