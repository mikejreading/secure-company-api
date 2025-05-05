const request = require('supertest');
const app = require('../server');
const User = require('../models/user.model');

describe('User Endpoints', () => {
  let token;
  let adminToken;
  let userId;

  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  const adminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  };

  beforeEach(async () => {
    // Create test user and get token
    const user = await User.create(testUser);
    userId = user._id.toString();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    token = res.body.token;

    // Create admin user and get token
    await User.create(adminUser);
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminRes.body.token;
  });

  describe('GET /api/users', () => {
    it('should allow admin to get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(2);
    });

    it('should not allow regular user to get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe(testUser.email);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/users/654321654321654321654321')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      const update = { name: 'Updated Name' };
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(update);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(update.name);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow admin to delete user', async () => {
      const res = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);
    });

    it('should not allow regular user to delete user', async () => {
      const res = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
