const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Error Handling', () => {
  describe('Error Middleware', () => {
    it('should handle validation errors', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'test@example.com',
          password: 'short'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation error');
    });

    it('should handle duplicate key errors', async () => {
      // Create initial user
      const firstUser = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(firstUser);

      // Try to create user with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send(firstUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/duplicate/i);
    });

    it('should handle invalid MongoDB ObjectId', async () => {
      // First create and login a user to get a valid token
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const res = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Internal server error');
    });
  });

  describe('Authentication Error Handling', () => {
    it('should handle invalid JWT token', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized to access this route');
    });

    it('should handle missing authorization header', async () => {
      const res = await request(app)
        .get('/api/users');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized to access this route');
    });
  });
});
