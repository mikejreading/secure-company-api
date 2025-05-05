const request = require('supertest');
const app = require('../server');
const User = require('../models/user.model');

describe('Input Validation', () => {
  describe('Registration Validation', () => {
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Name is required');
      expect(res.body.errors).toContain('Email is required');
      expect(res.body.errors).toContain('Password is required');
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Please provide a valid email');
    });

    it('should validate password requirements', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak'
        });

      expect(res.statusCode).toBe(400);
      const errors = res.body.errors[0].split(', ');
      expect(errors).toContain('Password must be at least 8 characters long');
      expect(errors).toContain('Password must contain at least one uppercase letter');
      expect(errors).toContain('Password must contain at least one number');
      expect(errors).toContain('Password must contain at least one special character');
    });

    it('should validate name length', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A',
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Name must be between 2 and 50 characters');
    });
  });

  describe('Login Validation', () => {
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Email is required');
      expect(res.body.errors).toContain('Password is required');
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Please provide a valid email');
    });
  });

  describe('User Update Validation', () => {
    let token;

    beforeEach(async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      token = res.body.token;
    });

    it('should validate email format on update', async () => {
      const res = await request(app)
        .put(`/api/users/${await User.findOne().then(user => user._id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'invalid-email'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Please provide a valid email');
    });

    it('should validate name length on update', async () => {
      const res = await request(app)
        .put(`/api/users/${await User.findOne().then(user => user._id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'A'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Name must be between 2 and 50 characters');
    });
  });
});
